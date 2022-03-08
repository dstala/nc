// // Project CRUD

import ncMetaAclMw from './helpers/ncMetaAclMw';
import Model from '../../../noco-models/Model';
import Project from '../../../noco-models/Project';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { ModelTypes, UITypes } from 'nc-common';
import { Router } from 'express';
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
);

// @ts-ignore
export async function metaDiff(req, res): Promise<Array<MetaDiff>> {
  const changes: Array<MetaDiff> = [];

  const project = await Project.getWithInfo(req.params.projectId);
  const base = project.bases.find(b => b.id === req.params.baseId);

  // @ts-ignore
  const sqlClient = NcConnectionMgrv2.getSqlClient(base);

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
            type: MetaDiffType.TABLE_NEW
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

  res.json(changes);
}

const router = Router();
router.get('/projects/:projectId/:baseId/metaDiff', ncMetaAclMw(metaDiff));
export default router;
