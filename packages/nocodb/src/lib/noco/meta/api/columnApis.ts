import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { Table } from '../../../noco-client/Api';
import UITypes from '../../../sqlUi/UITypes';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Base from '../../../noco-models/Base';
import Column from '../../../noco-models/Column';
import { substituteColumnNameWithIdInFormula } from './helpers/formulaHelpers';
import validateParams from './helpers/validateParams';

/***
 *
 *
 * altered
 *  1 - new column
 *  4 - deleted
 *  8 or 2 - column update
 *
 * */

export enum Altered {
  NEW_COLUMN = 1,
  DELETE_COLUMN = 4,
  UPDATE_COLUMN = 8
}

export async function columnAdd(req: Request, res: Response<Table>, next) {
  try {
    const table = await Model.getWithInfo({
      id: req.params.tableId
    });
    const base = await Base.get(table.base_id);

    const colBody = req.body;
    switch (colBody.uidt) {
      case UITypes.Lookup:
      case UITypes.Rollup:
        return next(new Error('Not implemented'));

      case UITypes.LinkToAnotherRecord:
      case UITypes.ForeignKey:
        {
          validateParams(['parentId', 'childId', 'type'], req.body);
          const parent = await Model.get({ id: req.body.parentId });
          const child = await Model.get({ id: req.body.childId });

          if (req.body.type === 'hm' || req.body.type === 'bt') {
            // populate fk column name
            let fkColName = `${parent.tn}_id`;
            let c = 0;
            while (child.columns.some(c => c.cn === `fkColName${c || ''}`)) {
              c++;
            }
            fkColName = `fkColName${c || ''}`;

            console.log(fkColName);
          } else if (req.body.type === 'mm') {
            throw new Error('Not implemented');
          }
        }
        break;

      case UITypes.Formula:
        colBody.formula = await substituteColumnNameWithIdInFormula(
          colBody.formula,
          table.columns
        );
        break;
      default:
        {
          const tableUpdateBody = {
            ...table,
            originalColumns: table.columns,
            columns: [
              ...table.columns,
              {
                ...colBody,
                altered: Altered.NEW_COLUMN
              }
            ]
          };

          const sqlMgr = await ProjectMgrv2.getSqlMgr({ id: base.project_id });
          await sqlMgr.sqlOpPlus(base, 'tableUpdate', tableUpdateBody);
        }
        break;
    }

    await Column.insert({
      ...colBody,
      fk_model_id: table.id
    });

    await table.getColumns(true);

    res.json(table);
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export async function columnUpdate(req: Request, res: Response<Table>, next) {
  const table = await Model.getWithInfo({
    id: req.params.tableId
  });
  const base = await Base.get(table.base_id);

  const column = table.columns.find(c => c.id === req.params.columnId);

  switch (column.uidt) {
    case UITypes.Lookup:
    case UITypes.Rollup:
    case UITypes.LinkToAnotherRecord:
    case UITypes.Formula:
    case UITypes.ForeignKey:
      return next(new Error('Not implemented'));
  }

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
        return { ...c, ...colBody, cno: c.cn, altered: Altered.UPDATE_COLUMN };
      }
      return c;
    })
  };

  const sqlMgr = await ProjectMgrv2.getSqlMgr({ id: base.project_id });
  await sqlMgr.sqlOpPlus(base, 'tableUpdate', tableUpdateBody);

  await Column.update(req.params.columnId, {
    ...colBody
  });

  await table.getColumns(true);

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
        return { ...c, cno: c.cn, altered: Altered.DELETE_COLUMN };
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
