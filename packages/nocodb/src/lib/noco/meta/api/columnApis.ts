import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { Table } from '../../../noco-client/Api';
import UITypes from '../../../sqlUi/UITypes';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Base from '../../../noco-models/Base';
import Column from '../../../noco-models/Column';

/***
 *
 *
 * altered
 *  1 - new column
 *  4 - deleted
 *  8 or 2 - column update
 *
 * */

export async function columnAdd(req: Request, res: Response<Table>, next) {
  const table = await Model.getWithInfo({
    id: req.params.tableId
  });
  const base = await Base.get(table.base_id);

  const colBody = req.body;
  switch (colBody.uidt) {
    case UITypes.Lookup:
    case UITypes.Rollup:
    case UITypes.LinkToAnotherRecord:
    case UITypes.Formula:
    case UITypes.ForeignKey:
      return next(new Error('Not implemented'));
  }

  const tableUpdateBody = {
    ...table,
    originalColumns: table.columns,
    columns: [
      ...table.columns,
      {
        ...colBody,
        altered: 1
      }
    ]
  };

  const sqlMgr = await ProjectMgrv2.getSqlMgr({ id: base.project_id });
  await sqlMgr.sqlOpPlus(base, 'tableUpdate', tableUpdateBody);
  await Column.insert({
    ...colBody,
    fk_model_id: table.id
  });

  await table.getColumns(true);

  res.json(table);
}
export async function columnUpdate(req: Request, res: Response<Table>) {
  const table = await Model.getWithInfo({
    base_id: req.params.projectId,
    id: req.params.tableId
  });
  res.json(table);
}

export async function columnDelete(req: Request, res: Response<Table>, next) {
  const table = await Model.getWithInfo({
    id: req.params.tableId
  });
  const base = await Base.get(table.base_id);

  const colBody = req.body;
  switch (colBody.uidt) {
    case UITypes.Lookup:
    case UITypes.Rollup:
    case UITypes.LinkToAnotherRecord:
    case UITypes.Formula:
    case UITypes.ForeignKey:
      return next(new Error('Not implemented'));
  }

  const tableUpdateBody = {
    ...table,
    originalColumns: table.columns.map(c => ({ ...c, cno: c.cn })),
    columns: table.columns.map(c => {
      if (c.id === req.params.columnId) {
        return { ...c, cno: c.cn, altered: 4 };
      }
      return c;
    })
  };

  const sqlMgr = await ProjectMgrv2.getSqlMgr({ id: base.project_id });
  await sqlMgr.sqlOpPlus(base, 'tableUpdate', tableUpdateBody);

  await Column.delete(req.params.columnId);

  await table.getColumns(true);

  res.json(table);
}

const router = Router({ mergeParams: true });
router.post('/', columnAdd);
router.put('/:columnId', columnUpdate);
router.delete('/:columnId', columnDelete);
export default router;
