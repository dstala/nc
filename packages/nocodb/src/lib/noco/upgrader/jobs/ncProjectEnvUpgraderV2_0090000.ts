import { NcUpgraderCtx } from '../NcUpgrader';
import Noco from '../../Noco';
import User from '../../../noco-models/User';
import Project from '../../../noco-models/Project';
import ProjectUser from '../../../noco-models/ProjectUser';
import Model from '../../../noco-models/Model';
import { ModelTypes, ViewTypes } from 'nc-common';
import Column from '../../../noco-models/Column';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import UITypes from '../../../sqlUi/UITypes';
import NcHelp from '../../../utils/NcHelp';
import { substituteColumnNameWithIdInFormula } from '../../meta/api/helpers/formulaHelpers';
import RollupColumn from '../../../noco-models/RollupColumn';
import View from '../../../noco-models/View';
import GridView from '../../../noco-models/GridView';
import KanbanView from '../../../noco-models/KanbanView';
import FormView from '../../../noco-models/FormView';
import GalleryView from '../../../noco-models/GalleryView';
import Sort from '../../../noco-models/Sort';
import Filter from '../../../noco-models/Filter';

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

export interface ShowFieldsv1 {
  [columnAlias: string]: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViewStatusv1 {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ColumnsWidthv1 {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtraViewParamsv1 {}

export interface QueryParamsv1 {
  filters: Array<{
    field: string;
    op: string;
    value: string | boolean | number;
    logicOp: 'and' | 'or';
  }>;
  sortList: Array<{
    field: string;
    order: '' | '-';
  }>;
  showFields: ShowFieldsv1;
  fieldsOrder: string[];
  viewStatus: ViewStatusv1;
  columnsWidth: ColumnsWidthv1;
  extraViewParams: ExtraViewParamsv1;
  showSystemFields: boolean;
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

interface ModelMetav1 {
  id: number;
  project_id: string;
  db_alias: string;
  title: string;
  alias: string;
  type: 'table' | 'vtable' | 'view';
  meta: string;
  schema: string;
  schema_previous: string;
  services: string;
  messages: string;
  enabled: boolean;
  parent_model_title: string;
  show_as: 'grid' | 'gallery' | 'form';
  query_params: string;
  list_idx: number;
  tags: string;
  pinned: boolean;
  mm: boolean;
  m_to_m_meta: string;
  order: number;
  view_order: number;
}

type ObjModelColumnRefv1 = {
  [projectId: string]: {
    [tableName: string]: {
      [columnName: string]: Column;
    };
  };
};
type ObjModelColumnAliasRefv1 = {
  [projectId: string]: {
    [tableName: string]: {
      [columnAlias: string]: Column;
    };
  };
};

type ObjModelRefv1 = {
  [projectId: string]: {
    [tableName: string]: Model;
  };
};
type ObjViewRefv1 = {
  [projectId: string]: {
    [tableName: string]: {
      [viewName: string]: View;
    };
  };
};
type ObjViewQPRefv1 = {
  [projectId: string]: {
    [tableName: string]: {
      [viewName: string]: QueryParamsv1;
    };
  };
};

// @ts-ignore
const filterV1toV2CompOpMap = {
  'is like': 'like',
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte',
  'is equal': 'eq',
  'is not null': 'notnull',
  'is null': 'null',
  'is not equal': 'neq',
  'is not like': 'nlike'
};

async function migrateProjectModels(ncMeta = Noco.ncMeta) {
  const metas: ModelMetav1[] = await ncMeta.metaList(null, null, 'nc_models');
  const models: Model[] = [];

  // variable for keeping all
  const objModelRef: ObjModelRefv1 = {};
  const objModelColumnRef: ObjModelColumnRefv1 = {};
  const objModelColumnAliasRef: ObjModelColumnAliasRefv1 = {};
  const objViewRef: ObjViewRefv1 = {};
  const objViewQPRef: ObjViewQPRefv1 = {};

  const virtualRelationColumnInsert: Array<() => Promise<any>> = [];
  const virtualColumnInsert: Array<() => Promise<any>> = [];
  const defaultViewsUpdate: Array<() => Promise<any>> = [];
  const views: ModelMetav1[] = [];

  for (const modelData of metas) {
    // @ts-ignore
    let queryParams: QueryParamsv1 = {};
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
      const projectModelColumnAliasRefs = (objModelColumnAliasRef[project.id] =
        objModelColumnAliasRef[project.id] || {});
      objModelColumnAliasRef[project.id][model.tn] =
        objModelColumnAliasRef[project.id][model.tn] || {};

      objViewRef[project.id] = objViewRef[project.id] || {};
      objViewRef[project.id][modelData.title] =
        objViewRef[project.id][modelData.title] || {};

      objViewQPRef[project.id] = objViewQPRef[project.id] || {};
      objViewQPRef[project.id][modelData.title] =
        objViewQPRef[project.id][modelData.title] || {};

      // migrate table columns
      for (const columnMeta of meta.columns) {
        const column = await Column.insert(
          {
            ...columnMeta,
            fk_model_id: model.id
          },
          ncMeta
        );

        projectModelColumnRefs[model.tn][
          column.cn
        ] = projectModelColumnAliasRefs[model.tn][column._cn] = column;
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

            projectModelColumnAliasRefs[model.tn][column._cn] = column;
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

              const columns = Object.values(
                projectModelColumnAliasRefs[model.tn]
              );

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

              const column = await Column.insert(
                {
                  uidt: UITypes.Lookup,
                  ...colBody,
                  fk_model_id: model.id
                },
                ncMeta
              );
              projectModelColumnAliasRefs[model.tn][column._cn] = column;
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

              const columns = Object.values(
                projectModelColumnAliasRefs[model.tn]
              );

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
              const column = await Column.insert(
                {
                  uidt: UITypes.Formula,
                  ...colBody,
                  fk_model_id: model.id
                },
                ncMeta
              );

              projectModelColumnAliasRefs[model.tn][column._cn] = column;
            }
          });
        }
      }

      defaultViewsUpdate.push(async () => {
        // insert default view data here
        // @ts-ignore
        const defaultView = await View.list(model.id, ncMeta).then(
          views => views[0]
        );

        objViewRef[project.id][modelData.title][
          defaultView.title
        ] = defaultView;
        objViewQPRef[project.id][modelData.title][
          defaultView.title
        ] = queryParams;

        const viewColumns = await View.getColumns(defaultView.id, ncMeta);

        for (const [_cn, column] of Object.entries(
          projectModelColumnAliasRefs[model.tn]
        )) {
          await View.updateColumn(
            defaultView.id,
            viewColumns.find(c => column.id === c.fk_column_id),
            {
              order: queryParams?.fieldsOrder?.indexOf(_cn) + 1,
              show: queryParams?.showFields?.[_cn]
            },
            ncMeta
          );
        }
        await View.update(
          defaultView.id,
          {
            show_system_fields: queryParams.showSystemFields,
            order: modelData.view_order
          },
          ncMeta
        );
      });
    } else {
      views.push(modelData);
    }
  }

  const type = Noco.getConfig()?.meta?.db?.client;

  await NcHelp.executeOperations(virtualRelationColumnInsert, type);
  await NcHelp.executeOperations(virtualColumnInsert, type);
  await NcHelp.executeOperations(defaultViewsUpdate, type);

  await migrateProjectModelViews(
    {
      views,
      objModelRef,
      objModelColumnAliasRef,
      objModelColumnRef,
      objViewRef,
      objViewQPRef
    },
    ncMeta
  );

  await migrateViewsParams(
    {
      views,
      objModelRef,
      objModelColumnAliasRef,
      objModelColumnRef,
      objViewRef,
      objViewQPRef
    },
    ncMeta
  );
}

async function migrateProjectModelViews(
  {
    views,
    objModelRef,
    // objModelColumnRef,
    objModelColumnAliasRef,
    objViewRef,
    objViewQPRef
  }: {
    views: ModelMetav1[];
    objModelRef: ObjModelRefv1;
    objModelColumnRef: ObjModelColumnRefv1;
    objModelColumnAliasRef: ObjModelColumnAliasRefv1;
    objViewRef: ObjViewRefv1;
    objViewQPRef: ObjViewQPRefv1;
  },
  ncMeta
) {
  for (const viewData of views) {
    const project = await Project.getWithInfo(viewData.project_id, ncMeta);
    // @ts-ignore
    const baseId = project.bases[0].id;

    // @ts-ignore
    let queryParams: QueryParamsv1 = {};
    if (viewData.query_params) {
      queryParams = JSON.parse(viewData.query_params);
    }

    objViewQPRef[project.id][viewData.parent_model_title][
      viewData.title
    ] = queryParams;

    const insertObj: Partial<View> &
      Partial<GridView | KanbanView | FormView | GalleryView> = {
      title: viewData.title,
      show: true,
      order: viewData.view_order,
      fk_model_id: objModelRef[project.id][viewData.parent_model_title].id,
      project_id: project.id,
      base_id: baseId
    };

    if (viewData.show_as === 'grid') {
      insertObj.type = ViewTypes.GRID;
    } else if (viewData.show_as === 'gallery') {
      insertObj.type = ViewTypes.GALLERY;

      // todo: add fk_cover_image_col_id
    } else if (viewData.show_as === 'form') {
      insertObj.type = ViewTypes.FORM;
    } else throw new Error('not implemented');

    const view = await View.insert(insertObj, ncMeta);
    objViewRef[project.id][viewData.parent_model_title][view.title] = view;

    for (const [_cn, column] of Object.entries(
      objModelColumnAliasRef[project.id][viewData.parent_model_title]
    )) {
      await View.updateColumn(
        view.id,
        column.id,
        {
          order: queryParams?.fieldsOrder?.indexOf(_cn) + 1,
          show: queryParams?.showFields?.[_cn]
        },
        ncMeta
      );
    }
    await View.update(
      view.id,
      {
        show_system_fields: queryParams.showSystemFields,
        order: viewData.view_order
      },
      ncMeta
    );
  }
}

// migrate sort & filter
async function migrateViewsParams(
  {
    // views,
    // objModelRef,
    objModelColumnAliasRef,
    objViewRef,
    objViewQPRef
  }: {
    views: ModelMetav1[];
    objModelRef: ObjModelRefv1;
    objModelColumnRef: ObjModelColumnRefv1;
    objModelColumnAliasRef: ObjModelColumnAliasRefv1;
    objViewRef: ObjViewRefv1;
    objViewQPRef: ObjViewQPRefv1;
  },
  ncMeta
) {
  for (const projectId of Object.keys(objViewRef)) {
    for (const tn of Object.keys(objViewRef[projectId])) {
      for (const [viewTitle, view] of Object.entries(
        objViewRef[projectId][tn]
      )) {
        const queryParams = objViewQPRef[projectId][tn][viewTitle];

        // migrate view sort list
        for (const sort of queryParams.sortList || []) {
          await Sort.insert(
            {
              fk_column_id:
                objModelColumnAliasRef[projectId][tn][sort.field].id,
              fk_view_id: view.id,
              direction: sort.order === '-' ? 'desc' : 'asc'
            },
            ncMeta
          );
        }

        // migrate view filter list
        for (const filter of queryParams.filters || []) {
          await Filter.insert(
            {
              fk_column_id:
                objModelColumnAliasRef[projectId][tn][filter.field].id,
              fk_view_id: view.id,
              comparison_op: filterV1toV2CompOpMap[filter.op],
              value: filter.value
            },
            ncMeta
          );
        }
      }
    }
  }
}
