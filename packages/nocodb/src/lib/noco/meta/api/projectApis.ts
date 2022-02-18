import { Request, Response, Router } from 'express';
import Project from '../../../noco-models/Project';
import { ProjectList, ProjectListParams } from 'nc-common';
import { PagedResponseImpl } from './helpers/PagedResponse';
// import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import syncMigration from './helpers/syncMigration';
import { IGNORE_TABLES } from '../../common/BaseApiBuilder';
import ModelXcMetaFactory from '../../../sqlMgr/code/models/xc/ModelXcMetaFactory';
import Column from '../../../noco-models/Column';
import Model from '../../../noco-models/Model';
import NcHelp from '../../../utils/NcHelp';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import getTableNameAlias from './helpers/getTableName';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';

// // Project CRUD

export async function projectGet(
  req: Request<any, any, any, ProjectListParams>,
  res: Response<Project>
) {
  console.log(req.query.page);
  const project = await Project.getWithInfo(req.params.projectId);

  res.json(project);
}
export async function projectList(
  req: Request<any, any, any, ProjectListParams>,
  res: Response<ProjectList>,
  next
) {
  try {
    console.log(req.query.page);
    const projects = await Project.list({});

    res // todo: pagination
      .json({
        projects: new PagedResponseImpl(projects, {
          totalRows: projects.length,
          pageSize: 20,
          page: 1
        })
      });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

//
//

async function projectCreate(req, res, next) {
  console.log(req.body);
  try {
    const project = await Project.createProject(req.body);

    // await ProjectMgrv2.getSqlMgr(project).projectOpenByWeb();
    await syncMigration(project);

    // todo: if existing table create models

    for (const base of await project.getBases())
      await populateMeta(base, project);

    res.json(project);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

async function populateMeta(base: Base, project: Project): Promise<any> {
  const sqlClient = NcConnectionMgrv2.getSqlClient(base);
  let order = 1;
  const metasArr = [];
  const models2 = {};

  const virtualColumnsInsert = [];

  /* Get all relations */
  const relations = (await sqlClient.relationListAll())?.data?.list;

  // const relationsCount = relations.length;

  let tables = (await sqlClient.tableList())?.data?.list
    ?.filter(({ tn }) => !IGNORE_TABLES.includes(tn))
    ?.map(t => {
      t.order = ++order;
      return t;
    });

  /* filter based on prefix */
  if (project?.prefix) {
    tables = tables.filter(t => {
      t._tn = t._tn || t.tn.replace(project?.prefix, '');
      return t?.tn?.startsWith(project?.prefix);
    });
  }

  relations.forEach(r => {
    r._tn = getTableNameAlias(r.tn, project.prefix);
    r._rtn = getTableNameAlias(r.rtn, project.prefix);
  });
  tables.forEach(t => {
    t._tn = getTableNameAlias(t.tn, project.prefix);
  });

  // await this.syncRelations();

  const tableRoutes = tables.map(table => {
    return async () => {
      /* filter relation where this table is present */
      const tableRelations = relations.filter(
        r => r.tn === table.tn || r.rtn === table.tn
      );

      const columns = (await sqlClient.columnList({ tn: table.tn }))?.data
        ?.list;

      const hasMany =
        table.type === 'view'
          ? []
          : JSON.parse(
              JSON.stringify(tableRelations.filter(r => r.rtn === table.tn))
            );
      const belongsTo =
        table.type === 'view'
          ? []
          : JSON.parse(
              JSON.stringify(tableRelations.filter(r => r.tn === table.tn))
            );

      const ctx = {
        dbType: base.type,
        ...table,
        columns,
        relations,
        hasMany,
        belongsTo,
        project_id: project.id
      };

      /* create models from table metadata */
      const meta = ModelXcMetaFactory.create(
        { client: base.type },
        {
          dir: '',
          ctx,
          filename: ''
        }
      ).getObject();
      metasArr.push(meta);

      // await Model.insert(project.id, base.id, meta);

      /* create nc_models and its rows if it doesn't exists  */
      models2[table.tn] = await Model.insert(project.id, base.id, {
        tn: table.tn,
        _tn: meta._tn,
        type: table.type || 'table',
        order: table.order
      });

      let colOrder = 1;

      for (const column of meta.columns) {
        await Column.insert({
          fk_model_id: models2[table.tn].id,
          ...column,
          order: colOrder++
        });
      }
      virtualColumnsInsert.push(async () => {
        const columnNames = {};
        for (const column of meta.v) {
          // generate unique name if there is any duplicate column name
          let c = 0;
          while (`${column._cn}${c || ''}` in columnNames) {
            c++;
          }
          column._cn = `${column._cn}${c || ''}`;
          columnNames[column._cn] = true;

          const rel = column.hm || column.bt || column.mm;

          const rel_column_id = (await models2?.[rel.tn]?.getColumns())?.find(
            c => c.cn === rel.cn
          )?.id;

          const tnId = models2?.[rel.tn]?.id;

          const ref_rel_column_id = (
            await models2?.[rel.rtn]?.getColumns()
          )?.find(c => c.cn === rel.rcn)?.id;

          const rtnId = models2?.[rel.rtn]?.id;

          let fk_mm_model_id;
          let fk_mm_child_column_id;
          let fk_mm_parent_column_id;

          if (column.mm) {
            fk_mm_model_id = models2?.[rel.vtn]?.id;
            fk_mm_child_column_id = (
              await models2?.[rel.vtn]?.getColumns()
            )?.find(c => c.cn === rel.vcn)?.id;
            fk_mm_parent_column_id = (
              await models2?.[rel.vtn]?.getColumns()
            )?.find(c => c.cn === rel.vrcn)?.id;
          }
          try {
            await Column.insert<LinkToAnotherRecordColumn>({
              project_id: project.id,
              db_alias: base.id,
              fk_model_id: models2[table.tn].id,
              cn: column.cn,
              _cn: column._cn,
              uidt: column.uidt,
              type: column.hm ? 'hm' : column.mm ? 'mm' : 'bt',
              // column_id,
              fk_child_column_id: rel_column_id,
              fk_parent_column_id: ref_rel_column_id,
              fk_index_name: rel.fkn,
              ur: rel.ur,
              dr: rel.dr,
              fk_mm_model_id,
              fk_mm_child_column_id,
              fk_mm_parent_column_id,
              order: colOrder++,
              fk_related_model_id: column.hm ? tnId : rtnId
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    };
  });

  /* handle xc_tables update in parallel */
  await NcHelp.executeOperations(tableRoutes, base.type);
  await getManyToManyRelations(metasArr);
  await NcHelp.executeOperations(virtualColumnsInsert, base.type);

  // this.baseModels2 = (
  //   await Model.list({ project_id: this.projectId, db_alias: this.dbAlias })
  // ).reduce((models, m) => {
  //   return {
  //     ...models,
  //     [m.title]: new BaseModelSqlv2({
  //       model: m,
  //       dbDriver: this.dbDriver,
  //       baseModels: this.baseModels2
  //     })
  //   };
  // }, {});

  // this.nocoTypes = await NocoTypeGenerator.generate(
  //   Object.values(models2),
  //   {
  //     ncMeta: Noco.xcMeta,
  //     baseModels2: this.baseModels2
  //   }
  // );
  //
  // this.nocoRootResolvers = await NocoResolverGenerator.generate(
  //   Object.values(models2),
  //   {
  //     ncMeta: Noco.xcMeta,
  //     types: this.nocoTypes,
  //     baseModels2: this.baseModels2
  //   }
  // );
}

async function getManyToManyRelations(
  metasArr: Array<{
    tn: string;
    _tn: string;
    columns: any[];
    belongsTo: any[];
    hasMany: any[];
  }>
) {
  const metasRefObj = metasArr.reduce((o, m) => ({ ...o, [m.tn]: m }), {});

  const metas = new Set<any>();
  const assocMetas = new Set<any>();
  for (const meta of Object.values(metasArr)) {
    // check if table is a Bridge table(or Associative Table) by checking
    // number of foreign keys and columns
    if (meta.belongsTo?.length === 2 && meta.columns.length < 5) {
      const tableMetaA = metasRefObj[meta.belongsTo[0].rtn];
      const tableMetaB = metasRefObj[meta.belongsTo[1].rtn];

      /*        // remove hasmany relation with associate table from tables
            tableMetaA.hasMany.splice(tableMetaA.hasMany.findIndex(hm => hm.tn === meta.tn), 1)
            tableMetaB.hasMany.splice(tableMetaB.hasMany.findIndex(hm => hm.tn === meta.tn), 1)*/

      // add manytomany data under metadata of both linked tables
      tableMetaA.manyToMany = tableMetaA.manyToMany || [];
      if (tableMetaA.manyToMany.every(mm => mm.vtn !== meta.tn)) {
        tableMetaA.manyToMany.push({
          tn: tableMetaA.tn,
          cn: meta.belongsTo[0].rcn,
          vtn: meta.tn,
          vcn: meta.belongsTo[0].cn,
          vrcn: meta.belongsTo[1].cn,
          rtn: meta.belongsTo[1].rtn,
          rcn: meta.belongsTo[1].rcn,
          _tn: tableMetaA._tn,
          _cn: meta.belongsTo[0]._rcn,
          _rtn: meta.belongsTo[1]._rtn,
          _rcn: meta.belongsTo[1]._rcn
        });
        metas.add(tableMetaA);
      }
      // ignore if A & B are same table
      if (tableMetaB !== tableMetaA) {
        tableMetaB.manyToMany = tableMetaB.manyToMany || [];
        if (tableMetaB.manyToMany.every(mm => mm.vtn !== meta.tn)) {
          tableMetaB.manyToMany.push({
            tn: tableMetaB.tn,
            cn: meta.belongsTo[1].rcn,
            vtn: meta.tn,
            vcn: meta.belongsTo[1].cn,
            vrcn: meta.belongsTo[0].cn,
            rtn: meta.belongsTo[0].rtn,
            rcn: meta.belongsTo[0].rcn,
            _tn: tableMetaB._tn,
            _cn: meta.belongsTo[1]._rcn,
            _rtn: meta.belongsTo[0]._rtn,
            _rcn: meta.belongsTo[0]._rcn
          });
          metas.add(tableMetaB);
        }
      }
      assocMetas.add(meta);
    }
  }

  // Update metadata of tables which have manytomany relation
  // and recreate basemodel with new meta information
  for (const meta of metas) {
    meta.v = [
      ...meta.v.filter(
        vc => !(vc.hm && meta.manyToMany.some(mm => vc.hm.tn === mm.vtn))
      ),
      // todo: ignore duplicate m2m relations
      // todo: optimize, just compare associative table(Vtn)
      ...meta.manyToMany
        .filter(
          (v, i) =>
            !meta.v.some(
              v1 =>
                v1.mm &&
                ((v1.mm.tn === v.tn && v.rtn === v1.mm.rtn) ||
                  (v1.mm.rtn === v.tn && v.tn === v1.mm.rtn)) &&
                v.vtn === v1.mm.vtn
            ) &&
            // ignore duplicate
            !meta.manyToMany.some(
              (v1, i1) =>
                i1 !== i &&
                v1.tn === v.tn &&
                v.rtn === v1.rtn &&
                v.vtn === v1.vtn
            )
        )
        .map(mm => {
          return {
            mm,
            uidt: UITypes.LinkToAnotherRecord,
            _cn: `${mm._rtn}MMList`
          };
        })
    ];
  }
}

const router = Router({ mergeParams: true });
router.get('/:projectId', projectGet);
router.post('/', projectCreate);
router.get('/', projectList);
export default router;