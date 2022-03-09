// // Project CRUD

import ncMetaAclMw from './helpers/ncMetaAclMw';
import Model from '../../../noco-models/Model';
import Project from '../../../noco-models/Project';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { ModelTypes, RelationTypes, UITypes } from 'nc-common';
import { Router } from 'express';
import Base from '../../../noco-models/Base';
import ModelXcMetaFactory from '../../../sqlMgr/code/models/xc/ModelXcMetaFactory';
import Column from '../../../noco-models/Column';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { getUniqueColumnAliasName } from './helpers/getUniqueName';

export enum MetaDiffType {
  TABLE_NEW = 'TABLE_NEW',
  TABLE_REMOVE = 'TABLE_REMOVE',
  TABLE_COLUMN_ADD = 'TABLE_COLUMN_ADD',
  TABLE_COLUMN_TYPE_CHANGE = 'TABLE_COLUMN_TYPE_CHANGE',
  TABLE_COLUMN_REMOVE = 'TABLE_COLUMN_REMOVE',
  VIEW_NEW = 'VIEW_NEW',
  VIEW_REMOVE = 'VIEW_REMOVE',
  VIEW_COLUMN_ADD = 'VIEW_COLUMN_ADD',
  VIEW_COLUMN_TYPE_CHANGE = 'VIEW_COLUMN_TYPE_CHANGE',
  VIEW_COLUMN_REMOVE = 'VIEW_COLUMN_REMOVE',
  TABLE_RELATION_ADD = 'TABLE_RELATION_ADD',
  TABLE_RELATION_REMOVE = 'TABLE_RELATION_REMOVE',
  TABLE_VIRTUAL_RELATION_ADD = 'TABLE_VIRTUAL_RELATION_ADD',
  TABLE_VIRTUAL_RELATION_REMOVE = 'TABLE_VIRTUAL_RELATION_REMOVE',
  TABLE_VIRTUAL_M2M_REMOVE = 'TABLE_VIRTUAL_M2M_REMOVE'
}

type MetaDiff = {
  _tn?: string;
  tn: string;
  type: ModelTypes;
  detectedChanges: Array<MetaDiffChange>;
};

type MetaDiffChange = {
  msg?: string;
  // type: MetaDiffType;
} & (
  | {
      type: MetaDiffType.TABLE_NEW | MetaDiffType.VIEW_NEW;
      tn?: string;
    }
  | {
      type: MetaDiffType.TABLE_REMOVE | MetaDiffType.VIEW_REMOVE;
      tn?: string;
      model?: Model;
      id?: string;
    }
  | {
      type: MetaDiffType.TABLE_COLUMN_ADD | MetaDiffType.VIEW_COLUMN_ADD;
      tn?: string;
      model?: Model;
      id?: string;
      cn: string;
    }
  | {
      type:
        | MetaDiffType.TABLE_COLUMN_TYPE_CHANGE
        | MetaDiffType.VIEW_COLUMN_TYPE_CHANGE
        | MetaDiffType.TABLE_COLUMN_REMOVE
        | MetaDiffType.VIEW_COLUMN_REMOVE;
      tn?: string;
      model?: Model;
      id?: string;
      cn: string;
      column: Column;
      colId?: string;
    }
  | {
      type: MetaDiffType.TABLE_RELATION_REMOVE;
      tn?: string;
      rtn?: string;
      cn?: string;
      rcn?: string;
      colId: string;
      column: Column;
    }
  | {
      type: MetaDiffType.TABLE_RELATION_ADD;
      tn?: string;
      rtn?: string;
      cn?: string;
      rcn?: string;
      relationType: RelationTypes;
    }
);

async function getMetaDiff(
  sqlClient,
  project: Project,
  base: Base
): Promise<Array<MetaDiff>> {
  const changes: Array<MetaDiff> = [];
  const virtualRelationColumns: Column<LinkToAnotherRecordColumn>[] = [];

  // @ts-ignore
  const tableList = (await sqlClient.tableList())?.data?.list?.filter(t => {
    if (project?.prefix) {
      return t.tn?.startsWith(project?.prefix);
    }
    return true;
  });

  const colListRef = {};
  const oldMetas = await base.getModels();
  // @ts-ignore
  const oldTableMetas: Model[] = [];
  const oldViewMetas: Model[] = [];

  for (const model of oldMetas) {
    if (model.type === ModelTypes.TABLE) oldTableMetas.push(model);
    else if (model.type === ModelTypes.VIEW) oldViewMetas.push(model);
  }

  // @ts-ignore
  const relationList = (await sqlClient.relationListAll())?.data?.list;

  for (const table of tableList) {
    if (table.tn === 'nc_evolutions') continue;

    const oldMetaIdx = oldTableMetas.findIndex(m => m.tn === table.tn);

    // new table
    if (oldMetaIdx === -1) {
      changes.push({
        tn: table.tn,
        type: ModelTypes.TABLE,
        detectedChanges: [
          {
            type: MetaDiffType.TABLE_NEW,
            msg: `New table`
          }
        ]
      });
      continue;
    }

    const oldMeta = oldTableMetas[oldMetaIdx];

    oldTableMetas.splice(oldMetaIdx, 1);

    const tableProp: MetaDiff = {
      _tn: oldMeta._tn,
      tn: table.tn,
      type: ModelTypes.TABLE,
      detectedChanges: []
    };
    changes.push(tableProp);

    // check for column change
    colListRef[table.tn] = (
      await sqlClient.columnList({ tn: table.tn })
    )?.data?.list;

    await oldMeta.getColumns(true);

    for (const column of colListRef[table.tn]) {
      const oldColIdx = oldMeta.columns.findIndex(c => c.cn === column.cn);

      // new table
      if (oldColIdx === -1) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.TABLE_COLUMN_ADD,
          msg: `New column(${column.cn})`,
          cn: column.cn,
          id: oldMeta.id
        });
        continue;
      }

      const [oldCol] = oldMeta.columns.splice(oldColIdx, 1);

      if (oldCol.dt !== column.dt) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.TABLE_COLUMN_TYPE_CHANGE,
          msg: `Column type changed(${column.cn})`,
          cn: oldCol.cn,
          id: oldMeta.id,
          column: oldCol
        });
      }
    }
    for (const column of oldMeta.columns) {
      if (
        [
          UITypes.LinkToAnotherRecord,
          UITypes.Rollup,
          UITypes.Lookup,
          UITypes.Formula
        ].includes(column.uidt)
      ) {
        if (column.uidt === UITypes.LinkToAnotherRecord) {
          virtualRelationColumns.push(column);
        }

        continue;
      }

      tableProp.detectedChanges.push({
        type: MetaDiffType.TABLE_COLUMN_REMOVE,
        msg: `Column removed(${column.cn})`,
        cn: column.cn,
        id: oldMeta.id,
        column: column,
        colId: column.id
      });
    }
  }

  for (const model of oldTableMetas) {
    changes.push({
      tn: model.tn,
      type: ModelTypes.TABLE,
      detectedChanges: [
        {
          type: MetaDiffType.TABLE_REMOVE,
          msg: `Table removed`,
          tn: model.tn,
          id: model.id,
          model
        }
      ]
    });
  }

  for (const relationCol of virtualRelationColumns) {
    const colOpt = await relationCol.getColOptions<LinkToAnotherRecordColumn>();
    const parentCol = await colOpt.getParentColumn();
    const childCol = await colOpt.getChildColumn();
    const parentModel = await parentCol.getModel();
    const childModel = await childCol.getModel();

    // todo: many to many
    if (colOpt.type === RelationTypes.MANY_TO_MANY) continue;

    const dbRelation = relationList.find(
      r =>
        r.cn === childCol.cn &&
        r.tn === childModel.tn &&
        r.rcn === parentCol.cn &&
        r.rtn === parentModel.tn
    );

    if (dbRelation) {
      dbRelation.found = dbRelation.found || {};
      dbRelation.found[colOpt.type] = true;
    } else {
      changes
        .find(
          t =>
            t.tn ===
            (colOpt.type === RelationTypes.BELONGS_TO
              ? childModel.tn
              : parentModel.tn)
        )
        .detectedChanges.push({
          type: MetaDiffType.TABLE_RELATION_REMOVE,
          tn: childModel.tn,
          rtn: parentModel.tn,
          cn: childCol.cn,
          rcn: parentCol.cn,
          msg: `Relation removed`,
          colId: relationCol.id,
          column: relationCol
        });
    }
  }

  for (const relation of relationList) {
    if (!relation?.found?.[RelationTypes.BELONGS_TO]) {
      changes
        .find(t => t.tn === relation.tn)
        ?.detectedChanges.push({
          type: MetaDiffType.TABLE_RELATION_ADD,
          tn: relation.tn,
          rtn: relation.rtn,
          cn: relation.cn,
          rcn: relation.rcn,
          msg: `New relation added`,
          relationType: RelationTypes.BELONGS_TO
        });
    }
    if (!relation?.found?.[RelationTypes.HAS_MANY]) {
      changes
        .find(t => t.tn === relation.rtn)
        ?.detectedChanges.push({
          type: MetaDiffType.TABLE_RELATION_ADD,
          tn: relation.tn,
          rtn: relation.rtn,
          cn: relation.cn,
          rcn: relation.rcn,
          msg: `New relation added`,
          relationType: RelationTypes.BELONGS_TO
        });
    }
  }

  // views
  // @ts-ignore
  const viewList = (await sqlClient.viewList())?.data?.list
    ?.map(v => {
      v.type = 'view';
      v.tn = v.view_name;
      return v;
    })
    .filter(t => {
      if (project?.prefix) {
        return t.tn?.startsWith(project?.prefix);
      }
      return true;
    }); // @ts-ignore

  for (const view of viewList) {
    if (view.tn === 'nc_evolutions') continue;

    const oldMetaIdx = oldTableMetas.findIndex(m => m.tn === view.tn);

    // new table
    if (oldMetaIdx === -1) {
      changes.push({
        tn: view.tn,
        type: ModelTypes.VIEW,
        detectedChanges: [
          {
            type: MetaDiffType.VIEW_NEW,
            msg: `New view`
          }
        ]
      });
      continue;
    }

    const oldMeta = oldTableMetas[oldMetaIdx];

    oldTableMetas.splice(oldMetaIdx, 1);

    const tableProp: MetaDiff = {
      _tn: oldMeta._tn,
      tn: view.tn,
      type: ModelTypes.VIEW,
      detectedChanges: []
    };
    changes.push(tableProp);

    // check for column change
    colListRef[view.tn] = (
      await sqlClient.columnList({ tn: view.tn })
    )?.data?.list;

    await oldMeta.getColumns(true);

    for (const column of colListRef[view.tn]) {
      const oldColIdx = oldMeta.columns.findIndex(c => c.cn === column.cn);

      // new table
      if (oldColIdx === -1) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.VIEW_COLUMN_ADD,
          msg: `New column(${column.cn})`,
          cn: column.cn,
          id: oldMeta.id
        });
        continue;
      }

      const [oldCol] = oldMeta.columns.splice(oldColIdx, 1);

      if (oldCol.dt !== column.dt) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.TABLE_COLUMN_TYPE_CHANGE,
          msg: `Column type changed(${column.cn})`,
          cn: oldCol.cn,
          id: oldMeta.id,
          column: oldCol
        });
      }
    }
    for (const column of oldMeta.columns) {
      if (
        [
          UITypes.LinkToAnotherRecord,
          UITypes.Rollup,
          UITypes.Lookup,
          UITypes.Formula
        ].includes(column.uidt)
      ) {
        continue;
      }

      tableProp.detectedChanges.push({
        type: MetaDiffType.VIEW_COLUMN_REMOVE,
        msg: `Column removed(${column.cn})`,
        cn: column.cn,
        id: oldMeta.id,
        column: column,
        colId: column.id
      });
    }
  }

  for (const model of oldViewMetas) {
    changes.push({
      tn: model.tn,
      type: ModelTypes.TABLE,
      detectedChanges: [
        {
          type: MetaDiffType.VIEW_REMOVE,
          msg: `Table removed`,
          tn: model.tn,
          id: model.id,
          model
        }
      ]
    });
  }

  return changes;
}

export async function metaDiff(req, res) {
  const project = await Project.getWithInfo(req.params.projectId);
  const base = project.bases.find(b => b.id === req.params.baseId);

  // @ts-ignore
  const sqlClient = NcConnectionMgrv2.getSqlClient(base);
  const changes = await getMetaDiff(sqlClient, project, base);

  res.json(changes);
}

export async function metaDiffSync(req, res) {
  const project = await Project.getWithInfo(req.params.projectId);
  const base = project.bases.find(b => b.id === req.params.baseId);
  const virtualColumnInsert: Array<() => Promise<void>> = [];

  // @ts-ignore
  const sqlClient = NcConnectionMgrv2.getSqlClient(base);
  const changes = await getMetaDiff(sqlClient, project, base);

  /* Get all relations */
  const relations = (await sqlClient.relationListAll())?.data?.list;

  for (const { tn, detectedChanges } of changes) {
    for (const change of detectedChanges) {
      switch (change.type) {
        case MetaDiffType.TABLE_NEW:
          {
            const tableRelations = relations.filter(
              r => r.tn === tn || r.rtn === tn
            );
            const columns = (await sqlClient.columnList({ tn }))?.data?.list;

            const hasMany = JSON.parse(
              JSON.stringify(tableRelations.filter(r => r.rtn === tn))
            );
            const belongsTo = JSON.parse(
              JSON.stringify(tableRelations.filter(r => r.tn === tn))
            );

            const ctx = {
              dbType: base.type,
              tn,
              _tn: tn,
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

            // const model =
            await Model.insert(project.id, base.id, meta);

            // for (const col of meta.columns) {
            //   // await Column.insert({ fk_model_id: model.id, ...col });
            // }
            for (const v of meta.v) {
              // todo
              console.log(v);
              // await Column.insert(col);
            }
          }
          break;
        case MetaDiffType.VIEW_NEW:
          {
            const columns = (await sqlClient.columnList({ tn }))?.data?.list;
            const ctx = {
              dbType: base.type,
              tn,
              _tn: tn,
              columns,
              relations: [],
              hasMany: [],
              belongsTo: [],
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
            await Model.insert(project.id, base.id, meta);
          }
          break;
        case MetaDiffType.TABLE_REMOVE:
        case MetaDiffType.VIEW_REMOVE:
          {
            await change.model.delete();
          }
          break;
        case MetaDiffType.TABLE_COLUMN_ADD:
        case MetaDiffType.VIEW_COLUMN_ADD:
          {
            const columns = (await sqlClient.columnList({ tn }))?.data?.list;
            const column = columns.find(c => c.cn === change.cn);
            const metaFact = ModelXcMetaFactory.create(
              { client: base.type },
              {}
            );
            column.uidt = metaFact.getUIDataType(column);
            //todo: inflection
            column._cn = column.cn;
            await Column.insert({ fk_model_id: change.id, ...column });
          }
          // update old
          // populateParams.tableNames.push({ tn });
          // populateParams.oldMetas[tn] = oldMetas.find(m => m.tn === tn);

          break;
        case MetaDiffType.TABLE_COLUMN_TYPE_CHANGE:
        case MetaDiffType.VIEW_COLUMN_TYPE_CHANGE:
          {
            const columns = (await sqlClient.columnList({ tn }))?.data?.list;
            const column = columns.find(c => c.cn === change.cn);
            const metaFact = ModelXcMetaFactory.create(
              { client: base.type },
              {}
            );
            column.uidt = metaFact.getUIDataType(column);
            column._cn = change.column._cn;
            await Column.update(change.column.id, column);
          }
          break;
        case MetaDiffType.TABLE_COLUMN_REMOVE:
        case MetaDiffType.VIEW_COLUMN_REMOVE:
          await change.column.delete();
          break;
        case MetaDiffType.TABLE_RELATION_REMOVE:
          await change.column.delete();
          break;
        case MetaDiffType.TABLE_RELATION_ADD:
          {
            virtualColumnInsert.push(async () => {
              const parentModel = await Model.getByIdOrName({ tn: change.rtn });
              const childModel = await Model.getByIdOrName({ tn: change.tn });
              const parentCol = await parentModel
                .getColumns()
                .then(cols => cols.find(c => c.cn === change.rcn));
              const childCol = await childModel
                .getColumns()
                .then(cols => cols.find(c => c.cn === change.cn));

              if (change.relationType === RelationTypes.BELONGS_TO) {
                const _cn = getUniqueColumnAliasName(
                  childModel.columns,
                  `${parentModel._tn || parentModel.tn}Read`
                );
                await Column.insert<LinkToAnotherRecordColumn>({
                  uidt: UITypes.LinkToAnotherRecord,
                  _cn,
                  fk_model_id: childModel.id,
                  fk_related_model_id: parentModel.id,
                  type: RelationTypes.BELONGS_TO,
                  fk_parent_column_id: parentCol.id,
                  fk_child_column_id: childCol.id,
                  virtual: false
                });
              } else if (change.relationType === RelationTypes.HAS_MANY) {
                const _cn = getUniqueColumnAliasName(
                  childModel.columns,
                  `${childModel._tn || childModel.tn}List`
                );
                await Column.insert<LinkToAnotherRecordColumn>({
                  uidt: UITypes.LinkToAnotherRecord,
                  _cn,
                  fk_model_id: parentModel.id,
                  fk_related_model_id: childModel.id,
                  type: RelationTypes.HAS_MANY,
                  fk_parent_column_id: parentCol.id,
                  fk_child_column_id: childCol.id,
                  virtual: false
                });
              }
            });
          }
          break;
      }
    }
  }

  res.json({ msg: 'success' });
}

const router = Router();
router.get('/projects/:projectId/:baseId/metaDiff', ncMetaAclMw(metaDiff));
router.post('/projects/:projectId/:baseId/metaDiff', ncMetaAclMw(metaDiffSync));
export default router;
