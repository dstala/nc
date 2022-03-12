import { NcUpgraderCtx } from '../NcUpgrader';
import Noco from '../../Noco';
import User from '../../../noco-models/User';
import Project from '../../../noco-models/Project';
import ProjectUser from '../../../noco-models/ProjectUser';
import Model from '../../../noco-models/Model';
import { ModelTypes } from 'nc-common';
import Column from '../../../noco-models/Column';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import UITypes from '../../../sqlUi/UITypes';
import NcHelp from '../../../utils/NcHelp';
import { substituteColumnNameWithIdInFormula } from '../../meta/api/helpers/formulaHelpers';
import RollupColumn from '../../../noco-models/RollupColumn';

export default async function(ctx: NcUpgraderCtx) {
  const ncMeta = ctx.ncMeta;

  await migrateUsers(ncMeta);
  await migrateProjects(ncMeta);
  await migrateProjectUsers(ncMeta);
  await migrateProjectModels(ncMeta);

  // const projects = await ctx.ncMeta.projectList();
  //
  // for (const project of projects) {
  //   const projectConfig = JSON.parse(project.config);
  //
  //   /*    const projectBuilder = new NcProjectBuilder(this, this.config, project);
  //   this.projectBuilders.push(projectBuilder);
  //   let i = 0;
  //   for (const builder of this.projectBuilders) {
  //     if (
  //       projects[i].status === 'started' ||
  //       projects[i].status === 'starting'
  //     ) {
  //       await builder.init();
  //     }
  //     i++;
  //   }*/
  // }
}

async function migrateUsers(ncMeta = Noco.ncMeta) {
  const users = await ncMeta.metaList(null, null, 'xc_users');
  const userList: User[] = [];

  for (const user of users) {
    userList.push(await User.insert(user, ncMeta));
  }
  return userList;
}

async function migrateProjects(ncMeta = Noco.ncMeta) {
  const projects = await ncMeta.projectList();
  const projectList: Project[] = [];

  for (const project of projects) {
    const projectConfig = JSON.parse(project.config);

    const projectBody = {
      id: project.id,
      prefix: projectConfig.prefix,
      is_meta: !!projectConfig.prefix,
      title: projectConfig?.title,
      bases: projectConfig?.envs?._noco?.db?.map(d => ({
        is_meta: !!projectConfig.prefix,
        type: d.client,
        config: d
      }))
    };

    projectList.push(await Project.createProject(projectBody, ncMeta));
  }
}

async function migrateProjectUsers(ncMeta = Noco.ncMeta) {
  const projectUsers = await ncMeta.metaList(null, null, 'nc_projects_users');

  for (const projectUser of projectUsers) {
    await ProjectUser.insert(
      {
        project_id: projectUser.project_id,
        fk_user_id: projectUser.user_id,
        roles: projectUser.roles
      },
      ncMeta
    );
  }
}

interface Rollupv1 {
  _cn: string;
  rl: {
    type: string;
    tn: string;
    cn: string;
    vtn: string;
    vrcn: string;
    rcn: string;
    rtn: string;
    vcn: string;
    _rtn: string;
    rltn: string;
    _rltn: string;
    rlcn: string;
    _rlcn: string;
    fn: string;
  };
}

interface Formulav1 {
  _cn: string;
  formula: {
    value: string;
    tree: any;
  };
}

interface Lookupv1 {
  _cn: string;
  lk: {
    type: string;
    tn: string;
    cn: string;
    vtn: string;
    vrcn: string;
    rcn: string;
    rtn: string;
    vcn: string;
    _rtn: string;
    ltn: string;
    _ltn: string;
    lcn: string;
    _lcn: string;
  };
}

interface LinkToAnotherRecordv1 {
  _cn: string;
  hm?: any;
  bt?: any;
  mm?: any;
}

async function migrateProjectModels(ncMeta = Noco.ncMeta) {
  const metas: any[] = await ncMeta.metaList(null, null, 'nc_models');
  const models: Model[] = [];

  // variable for keeping all
  const objModelRef: {
    [projectId: string]: {
      [tableName: string]: Model;
    };
  } = {};
  const objModelColumnRef: {
    [projectId: string]: {
      [tableName: string]: {
        [columnName: string]: Column;
      };
    };
  } = {};

  const virtualRelationColumnInsert: Array<() => Promise<any>> = [];
  const virtualColumnInsert: Array<() => Promise<any>> = [];
  const viewsInsert: Array<() => Promise<any>> = [];

  for (const modelData of metas) {
    // @ts-ignore
    let queryParams = {};
    if (modelData.query_params) {
      queryParams = JSON.parse(modelData.query_params);
    }

    if (modelData.type === 'table' || modelData.type === 'view') {
      // parse meta

      const project = await Project.getWithInfo(modelData.project_id, ncMeta);
      const baseId = project.bases[0].id;

      const meta = JSON.parse(modelData.meta);
      const model = await Model.insert(
        project.id,
        baseId,
        {
          order: modelData.order,
          tn: modelData.title,
          _tn: modelData.alias,
          type: modelData.type === 'table' ? ModelTypes.TABLE : ModelTypes.VIEW
        },
        ncMeta
      );
      models.push(model);

      const projectModelRefs = (objModelRef[project.id] =
        objModelRef[project.id] || {});
      objModelRef[project.id][model.tn] = model;

      const projectModelColumnRefs = (objModelColumnRef[project.id] =
        objModelColumnRef[project.id] || {});
      objModelColumnRef[project.id][model.tn] =
        objModelColumnRef[project.id][model.tn] || {};

      // migrate table columns
      for (const columnMeta of meta.columns) {
        const column = await Column.insert(
          {
            ...columnMeta,
            fk_model_id: model.id
          },
          ncMeta
        );

        objModelColumnRef[project.id][model.tn][column.cn] = column;
      }

      // migrate table virtual columns
      for (const _columnMeta of meta.v) {
        if (_columnMeta.mm || _columnMeta.hm || _columnMeta.bt) {
          const columnMeta: LinkToAnotherRecordv1 = _columnMeta;
          virtualRelationColumnInsert.push(async () => {
            const rel = columnMeta.hm || columnMeta.bt || columnMeta.mm;

            const rel_column_id =
              projectModelColumnRefs?.[rel.tn]?.[rel.cn]?.id;

            const tnId = projectModelRefs?.[rel.tn]?.id;

            const ref_rel_column_id =
              projectModelColumnRefs?.[rel.rtn]?.[rel.rcn]?.id;

            const rtnId = projectModelRefs?.[rel.rtn]?.id;

            let fk_mm_model_id;
            let fk_mm_child_column_id;
            let fk_mm_parent_column_id;

            if (columnMeta.mm) {
              fk_mm_model_id = projectModelRefs[rel.vtn].id;
              fk_mm_child_column_id =
                projectModelColumnRefs[rel.vtn][rel.vcn].id;
              fk_mm_parent_column_id =
                projectModelColumnRefs[rel.vtn][rel.vrcn].id;
            }
            const column = await Column.insert<LinkToAnotherRecordColumn>(
              {
                project_id: project.id,
                db_alias: baseId,
                fk_model_id: model.id,
                // cn: columnMeta.cn,
                _cn: columnMeta._cn,
                uidt: UITypes.LinkToAnotherRecord,
                type: columnMeta.hm ? 'hm' : columnMeta.mm ? 'mm' : 'bt',
                fk_child_column_id: rel_column_id,
                fk_parent_column_id: ref_rel_column_id,
                fk_index_name: rel.fkn,
                ur: rel.ur,
                dr: rel.dr,
                fk_mm_model_id,
                fk_mm_child_column_id,
                fk_mm_parent_column_id,
                fk_related_model_id: columnMeta.hm ? tnId : rtnId
                // todo: mapping system field
                // system: columnMeta.system
              },
              ncMeta
            );

            objModelColumnRef[project.id][model.tn][
              column.cn || column._cn
            ] = column;
          });
        } else {
          // other virtual columns insert
          virtualColumnInsert.push(async () => {
            //  migrate lookup column
            if (_columnMeta.lk) {
              const columnMeta: Lookupv1 = _columnMeta;

              const colBody: any = {
                _cn: columnMeta._cn
              };

              colBody.fk_lookup_column_id =
                projectModelColumnRefs[columnMeta.lk.ltn][columnMeta.lk.lcn].id;

              const columns = Object.values(projectModelColumnRefs[model.tn]);

              // extract related(virtual relation) column id
              for (const col of columns) {
                if (col.uidt === UITypes.LinkToAnotherRecord) {
                  const colOpt = await col.getColOptions<
                    LinkToAnotherRecordColumn
                  >(ncMeta);
                  if (
                    colOpt.type === columnMeta.lk.type &&
                    colOpt.fk_child_column_id ===
                      projectModelColumnRefs[columnMeta.lk.tn][columnMeta.lk.cn]
                        .id &&
                    colOpt.fk_parent_column_id ===
                      projectModelColumnRefs[columnMeta.lk.rtn][
                        columnMeta.lk.rcn
                      ].id &&
                    (colOpt.type !== 'mm' ||
                      colOpt.fk_mm_model_id ===
                        projectModelRefs[columnMeta.lk.vtn].id)
                  ) {
                    colBody.fk_relation_column_id = col.id;
                    break;
                  }
                }
              }

              if (!colBody.fk_relation_column_id) {
                throw new Error('relation not found');
              }

              await Column.insert(
                {
                  uidt: UITypes.Lookup,
                  ...colBody,
                  fk_model_id: model.id
                },
                ncMeta
              );
            } else if (_columnMeta.rl) {
              //  migrate rollup column
              const columnMeta: Rollupv1 = _columnMeta;

              const colBody: Partial<RollupColumn & Column> = {
                _cn: columnMeta._cn,
                rollup_function: columnMeta.rl.fn
              };

              colBody.fk_rollup_column_id =
                projectModelColumnRefs[columnMeta.rl.rltn][
                  columnMeta.rl.rlcn
                ].id;

              const columns = Object.values(projectModelColumnRefs[model.tn]);

              // extract related(virtual relation) column id
              for (const col of columns) {
                if (col.uidt === UITypes.LinkToAnotherRecord) {
                  const colOpt = await col.getColOptions<
                    LinkToAnotherRecordColumn
                  >(ncMeta);
                  if (
                    colOpt.type === columnMeta.rl.type &&
                    colOpt.fk_child_column_id ===
                      projectModelColumnRefs[columnMeta.rl.tn][columnMeta.rl.cn]
                        .id &&
                    colOpt.fk_parent_column_id ===
                      projectModelColumnRefs[columnMeta.rl.rtn][
                        columnMeta.rl.rcn
                      ].id &&
                    (colOpt.type !== 'mm' ||
                      colOpt.fk_mm_model_id ===
                        projectModelRefs[columnMeta.rl.vtn].id)
                  ) {
                    colBody.fk_relation_column_id = col.id;
                    break;
                  }
                }
              }

              if (!colBody.fk_relation_column_id) {
                throw new Error('relation not found');
              }
              await Column.insert(
                {
                  uidt: UITypes.Rollup,
                  ...colBody,
                  fk_model_id: model.id
                },
                ncMeta
              );
            } else if (_columnMeta.formula) {
              const columnMeta: Formulav1 = _columnMeta;
              //  migrate formula column
              const colBody: any = {
                _cn: columnMeta._cn
              };
              colBody.formula = await substituteColumnNameWithIdInFormula(
                columnMeta.formula.value,
                await model.getColumns(ncMeta)
              );
              colBody.formula_raw = columnMeta.formula.value;
              await Column.insert(
                {
                  uidt: UITypes.Formula,
                  ...colBody,
                  fk_model_id: model.id
                },
                ncMeta
              );
            }
          });
        }
      }

      viewsInsert.push(async () => {
        // todo: insert default view data here
      });
    } else {
      viewsInsert.push(async () => {
        // todo: insert view data here
      });
    }
  }

  const type = Noco.getConfig()?.meta?.db?.client;

  await NcHelp.executeOperations(virtualRelationColumnInsert, type);
  await NcHelp.executeOperations(virtualColumnInsert, type);
  await NcHelp.executeOperations(viewsInsert, type);
}

/***
 *
 users
 - copy users

 projects
 - copy project
 - create bases
 project user roles
 - map users to project

 models
 - create model data and column data

 views
 - create views and view columns
 - set order , visibility

 fields
 - populate view columns

 filters
 - copy view filters

 sorts
 - copy view sorts

 plugins configuration
 - copy plugin configurations

 audits
 -

 todo: api tokens
 - add migration
 - copy api tokens

 webhooks
 - copy webhooks

 model_role_ui_acl
 - copy ui acl

 shared views
 - copy shared views id to corresponding view

 shared base
 - copy shared base id


 */
