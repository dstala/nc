// // Project CRUD

import ncMetaAclMw from './helpers/ncMetaAclMw';
import Model from '../../../noco-models/Model';
import Project from '../../../noco-models/Project';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { ModelTypes, UITypes } from 'nc-common';
import { Router } from 'express';
import Base from '../../../noco-models/Base';
import ModelXcMetaFactory from '../../../sqlMgr/code/models/xc/ModelXcMetaFactory';
import Column from '../../../noco-models/Column';

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
  tn: string;
  type: ModelTypes;
  detectedChanges: Array<MetaDiffChange>;
};

type MetaDiffChange = {
  msg?: string;
  // type: MetaDiffType;
} & (
  | {
      type: MetaDiffType.TABLE_NEW;
      tn?: string;
    }
  | {
      type: MetaDiffType.TABLE_REMOVE;
      tn?: string;
      model?: Model;
      id?: string;
    }
  | {
      type: MetaDiffType.TABLE_COLUMN_ADD;
      tn?: string;
      model?: Model;
      id?: string;
      cn: string;
    }
);

async function getMetaDiff(
  sqlClient,
  project: Project,
  base: Base
): Promise<Array<MetaDiff>> {
  const changes: Array<MetaDiff> = [];

  // @ts-ignore
  const tableList = (await sqlClient.tableList())?.data?.list?.filter(t => {
    if (project?.prefix) {
      return t.tn?.startsWith(project?.prefix);
    }
    return true;
  });

  const colListRef = {};
  // @ts-ignore
  const oldMetas = await base.getModels();

  // @ts-ignore
  const relationList = (await sqlClient.relationListAll())?.data?.list;

  for (const table of tableList) {
    if (table.tn === 'nc_evolutions') continue;

    const oldMetaIdx = oldMetas.findIndex(m => m.tn === table.tn);

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

    const oldMeta = oldMetas[oldMetaIdx];

    oldMetas.splice(oldMetaIdx, 1);

    const tableProp = {
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
      // virtual columns
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

      const oldColIdx = oldMeta.columns.findIndex(c => c.cn === column.cn);

      // new table
      if (oldColIdx === -1) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.TABLE_COLUMN_ADD,
          msg: `New column(${column.cn})`,
          cn: column.cn
        });
        continue;
      }

      const [oldCol] = oldMeta.columns.splice(oldColIdx, 1);

      if (oldCol.dt !== column.dt) {
        tableProp.detectedChanges.push({
          type: MetaDiffType.TABLE_COLUMN_TYPE_CHANGE,
          msg: `Column type changed(${column.cn})`,
          cn: oldCol.cn,
          id: oldCol.id,
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
        type: MetaDiffType.TABLE_COLUMN_REMOVE,
        msg: `Column removed(${column.cn})`,
        cn: column.cn,
        id: column.id,
        column: column
      });
    }
  }

  for (const model of oldMetas) {
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

            const model = await Model.insert(project.id, base.id, meta);

            for (const col of meta.columns) {
              await Column.insert({ fk_model_id: model.id, ...col });
            }
            for (const v of meta.v) {
              // todo
              console.log(v);
              // await Column.insert(col);
            }
          }
          break;
        case MetaDiffType.TABLE_REMOVE:
          {
            await change.model.delete();
          }
          break;
        case MetaDiffType.TABLE_COLUMN_ADD:
          {
            const columns = (await sqlClient.columnList({ tn }))?.data?.list;
            const column = columns.find(c => c.cn === change.cn);
            const metaFact = ModelXcMetaFactory.create(
              { client: base.type },
              {}
            );
            column.uidt = metaFact.getUIDataType(column);
            await Column.insert({ fk_column_id: change.id, ...column });
          }
          // update old
          // populateParams.tableNames.push({ tn });
          // populateParams.oldMetas[tn] = oldMetas.find(m => m.tn === tn);

          break;
        // case MetaDiffType.TABLE_COLUMN_TYPE_CHANGE:
        //   // update type in old meta
        //
        //   populateParams.oldMetas[tn] = oldMetas.find(m => m.tn === tn);
        //   populateParams.tableNames.push({
        //     tn,
        //     _tn: populateParams.oldMetas[tn]?._tn
        //   });
        //
        //   break;
        //         case MetaDiffType.TABLE_COLUMN_REMOVE:
        //           {
        //             const oldMetaIdx = oldMetas.findIndex(m => m.tn === tn);
        //             if (oldMetaIdx === -1)
        //               throw new Error('Old meta not found : ' + tn);
        //
        //             const oldMeta = oldMetas[oldMetaIdx];
        //
        //             populateParams.oldMetas[tn] = oldMeta;
        //             populateParams.tableNames.push({
        //               tn,
        //               _tn: populateParams.oldMetas[tn]?._tn
        //             });
        //
        //             const queryParams = oldQueryParams[oldMetaIdx];
        //
        //             const oldColumn = oldMeta.columns.find(c => c.cn === change?.cn);
        //
        //             const {
        //               virtualViews,
        //               virtualViewsParamsArr
        //               // @ts-ignore
        //             } = await this.extractSharedAndVirtualViewsParams(tn);
        //             // virtual views param update
        //             for (const qp of [queryParams, ...virtualViewsParamsArr]) {
        //               if (!qp) continue;
        //
        //               // @ts-ignore
        //               const {
        //                 filters = {},
        //                 sortList = [],
        //                 showFields = {},
        //                 fieldsOrder = [],
        //                 extraViewParams = {}
        //               } = qp;
        //
        //               /* update sort field */
        //               /*   const sIndex = (sortList || []).findIndex(
        //   v => v.field === oldColumn._cn
        // );
        // if (sIndex > -1) {
        //   sortList.splice(sIndex, 1);
        // }*/
        //               for (const sort of sortList || []) {
        //                 if (
        //                   sort?.field === oldColumn.cn ||
        //                   sort?.field === oldColumn._cn
        //                 ) {
        //                   sortList.splice(sortList.indexOf(sort), 1);
        //                 }
        //               }
        //
        //               /* update show field */
        //               if (oldColumn.cn in showFields || oldColumn._cn in showFields) {
        //                 delete showFields[oldColumn.cn];
        //                 delete showFields[oldColumn._cn];
        //               }
        //               /* update filters */
        //               // todo: remove only corresponding filter and compare field name
        //               /* if (
        //  filters &&
        //  (JSON.stringify(filters)?.includes(`"${oldColumn.cn}"`) ||
        //    JSON.stringify(filters)?.includes(`"${oldColumn._cn}"`))
        // ) {
        //  filters.splice(0, filters.length);
        // }*/
        //               for (const filter of filters) {
        //                 if (
        //                   filter?.field === oldColumn.cn ||
        //                   filter?.field === oldColumn._cn
        //                 ) {
        //                   filters.splice(filters.indexOf(filter), 1);
        //                 }
        //               }
        //
        //               /* update fieldsOrder */
        //               let index = fieldsOrder.indexOf(oldColumn.cn);
        //               if (index > -1) {
        //                 fieldsOrder.splice(index, 1);
        //               }
        //               index = fieldsOrder.indexOf(oldColumn._cn);
        //               if (index > -1) {
        //                 fieldsOrder.splice(index, 1);
        //               }
        //
        //               /* update formView params */
        //               //  extraViewParams.formParams.fields
        //               if (extraViewParams?.formParams?.fields?.[oldColumn.cn]) {
        //                 delete extraViewParams.formParams.fields[oldColumn.cn];
        //               }
        //               if (extraViewParams?.formParams?.fields?.[oldColumn._cn]) {
        //                 delete extraViewParams.formParams.fields[oldColumn._cn];
        //               }
        //             }
        //
        //             // todo: enable
        //             await this.updateSharedAndVirtualViewsParams(
        //               virtualViewsParamsArr,
        //               virtualViews
        //             );
        //
        //             await this.metaQueryParamsUpdate(queryParams, tn);
        //
        //             // Delete lookup columns mapping to current column
        //             // update column name in belongs to
        //             if (oldMeta.belongsTo?.length) {
        //               for (const bt of oldMeta.belongsTo) {
        //                 // filter out lookup columns which maps to current col
        //                 oldMetasRef[bt.rtn].v = oldMetasRef[bt.rtn].v?.filter(v => {
        //                   if (v.lk && v.lk.ltn === tn && v.lk.lcn === oldColumn.cn) {
        //                     relationTableMetas.add(oldMetasRef[bt.rtn]);
        //                     return false;
        //                   }
        //                   return true;
        //                 });
        //               }
        //             }
        //
        //             // update column name in has many
        //             if (oldMeta.hasMany?.length) {
        //               for (const hm of oldMeta.hasMany) {
        //                 // filter out lookup columns which maps to current col
        //                 oldMetasRef[hm.tn].v = oldMetasRef[hm.tn].v?.filter(v => {
        //                   if (v.lk && v.lk.ltn === tn && v.lk.lcn === change.cn) {
        //                     relationTableMetas.add(oldMetasRef[hm.tn]);
        //                     return false;
        //                   }
        //                   return true;
        //                 });
        //               }
        //             }
        //
        //             // update column name in many to many
        //             if (oldMeta.manyToMany?.length) {
        //               for (const mm of oldMeta.manyToMany) {
        //                 // filter out lookup columns which maps to current col
        //                 oldMetasRef[mm.rtn].v = oldMetasRef[mm.rtn].v?.filter(v => {
        //                   if (v.lk && v.lk.ltn === tn && v.lk.lcn === change.cn) {
        //                     relationTableMetas.add(oldMetasRef[mm.rtn]);
        //                     return false;
        //                   }
        //                   return true;
        //                 });
        //               }
        //             }
        //           }
        //           break;
      }
    }
  }

  res.json({ msg: 'success' });
}

const router = Router();
router.get('/projects/:projectId/:baseId/metaDiff', ncMetaAclMw(metaDiff));
router.post('/projects/:projectId/:baseId/metaDiff', ncMetaAclMw(metaDiffSync));
export default router;
