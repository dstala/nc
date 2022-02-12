import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { LinkToAnotherRecord, Table } from 'nc-common';
import UITypes from '../../../sqlUi/UITypes';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Base from '../../../noco-models/Base';
import Column from '../../../noco-models/Column';
import { substituteColumnNameWithIdInFormula } from './helpers/formulaHelpers';
import validateParams from './helpers/validateParams';

import { customAlphabet } from 'nanoid';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import {
  getUniqueColumnAliasName,
  getUniqueColumnName
} from './helpers/getUniqueName';

const randomID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz_', 10);

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
    const project = await base.getProject();

    const colBody = req.body;
    switch (colBody.uidt) {
      case UITypes.Rollup:
        {
          validateParams(
            [
              '_cn',
              'fk_relation_column_id',
              'fk_rollup_column_id',
              'rollup_function'
            ],
            req.body
          );

          const relation = await (
            await Column.get({
              colId: req.body.fk_relation_column_id
            })
          ).getColOptions<LinkToAnotherRecord>();

          if (!relation) {
            throw new Error('Relation column not found');
          }

          let relatedColumn: Column;
          switch (relation.type) {
            case 'hm':
              relatedColumn = await Column.get({
                colId: relation.fk_child_column_id
              });
              break;
            case 'mm':
            case 'bt':
              relatedColumn = await Column.get({
                colId: relation.fk_parent_column_id
              });
              break;
          }

          const relatedTable = await relatedColumn.getModel();
          if (
            !(await relatedTable.getColumns()).find(
              c => c.id === req.body.fk_rollup_column_id
            )
          )
            throw new Error('Rollup column not found in related table');

          await Column.insert({
            ...colBody,
            fk_model_id: table.id
          });
        }
        break;
      case UITypes.Lookup:
        {
          validateParams(
            ['_cn', 'fk_relation_column_id', 'fk_lookup_column_id'],
            req.body
          );

          const relation = await (
            await Column.get({
              colId: req.body.fk_relation_column_id
            })
          ).getColOptions<LinkToAnotherRecord>();

          if (!relation) {
            throw new Error('Relation column not found');
          }

          let relatedColumn: Column;
          switch (relation.type) {
            case 'hm':
              relatedColumn = await Column.get({
                colId: relation.fk_child_column_id
              });
              break;
            case 'mm':
            case 'bt':
              relatedColumn = await Column.get({
                colId: relation.fk_parent_column_id
              });
              break;
          }

          const relatedTable = await relatedColumn.getModel();
          if (
            !(await relatedTable.getColumns()).find(
              c => c.id === req.body.fk_lookup_column_id
            )
          )
            throw new Error('Lookup column not found in related table');

          await Column.insert({
            ...colBody,
            fk_model_id: table.id
          });
        }
        break;

      case UITypes.LinkToAnotherRecord:
      case UITypes.ForeignKey:
        {
          validateParams(['parentId', 'childId', 'type'], req.body);

          // get parent and child models
          const parent = await Model.getWithInfo({ id: req.body.parentId });
          const child = await Model.getWithInfo({ id: req.body.childId });
          let childColumn: Column;

          const sqlMgr = await ProjectMgrv2.getSqlMgr({
            id: base.project_id
          });
          if (req.body.type === 'hm' || req.body.type === 'bt') {
            // populate fk column name
            const fkColName = getUniqueColumnName(
              await child.getColumns(),
              `${parent.tn}_id`
            );

            {
              // create foreign key
              const newColumn = {
                cn: fkColName,
                _cn: fkColName,
                rqd: false,
                pk: false,
                ai: false,
                cdf: null,
                dt: parent.primaryKey.dt,
                dtxp: parent.primaryKey.dtxp,
                dtxs: parent.primaryKey.dtxs,
                un: parent.primaryKey.un,
                altered: Altered.NEW_COLUMN
              };
              const tableUpdateBody = {
                ...child,
                originalColumns: child.columns,
                columns: [...child.columns, newColumn]
              };

              await sqlMgr.sqlOpPlus(base, 'tableUpdate', tableUpdateBody);

              const { id } = await Column.insert({
                ...newColumn,
                uidt: UITypes.ForeignKey,
                fk_model_id: child.id
              });

              childColumn = await Column.get({ colId: id });

              // create relation
              await sqlMgr.sqlOpPlus(base, 'relationCreate', {
                childColumn: fkColName,
                childTable: child.tn,
                parentTable: parent.tn,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
                type: 'real',
                parentColumn: parent.primaryKey.cn
              });
            }

            // save bt column
            {
              const _cn = getUniqueColumnAliasName(
                await child.getColumns(),
                req.body.type === 'hm' ? `${parent._tn}Read` : req.body._cn
              );
              await Column.insert<LinkToAnotherRecordColumn>({
                _cn,

                fk_model_id: child.id,
                // ref_db_alias
                uidt: UITypes.LinkToAnotherRecord,
                type: 'bt',
                // db_type:

                fk_child_column_id: childColumn.id,
                fk_parent_column_id: parent.primaryKey.id,
                fk_related_table_id: parent.id
              });
            }
            // save hm column
            {
              const _cn = getUniqueColumnAliasName(
                await child.getColumns(),
                req.body.type === 'bt' ? `${parent._tn}List` : req.body._cn
              );
              await Column.insert({
                _cn,
                fk_model_id: parent.id,
                uidt: UITypes.LinkToAnotherRecord,
                type: 'hm',
                fk_child_column_id: childColumn.id,
                fk_parent_column_id: parent.primaryKey.id,
                fk_related_table_id: child.id
              });
            }
          } else if (req.body.type === 'mm') {
            const aTn = `${project?.prefix ?? ''}_nc_m2m_${randomID()}`;
            const aTnAlias = aTn;

            const parentPK = parent.primaryKey;
            const childPK = child.primaryKey;

            const associateTableCols = [];

            const parentCn = 'table1_id';
            const childCn = 'table2_id';

            associateTableCols.push(
              {
                cn: childCn,
                _cn: childCn,
                rqd: true,
                pk: true,
                ai: false,
                cdf: null,
                dt: childPK.dt,
                dtxp: childPK.dtxp,
                dtxs: childPK.dtxs,
                un: childPK.un,
                altered: 1,
                uidt: UITypes.ForeignKey
              },
              {
                cn: parentCn,
                _cn: parentCn,
                rqd: true,
                pk: true,
                ai: false,
                cdf: null,
                dt: parentPK.dt,
                dtxp: parentPK.dtxp,
                dtxs: parentPK.dtxs,
                un: parentPK.un,
                altered: 1,
                uidt: UITypes.ForeignKey
              }
            );

            await sqlMgr.sqlOpPlus(base, 'tableCreate', {
              tn: aTn,
              _tn: aTnAlias,
              columns: associateTableCols
            });

            const assocModel = await Model.insert(project.id, base.id, {
              tn: aTn,
              _tn: aTnAlias,
              columns: associateTableCols
            });

            const rel1Args = {
              ...req.body,
              childTable: aTn,
              childColumn: parentCn,
              parentTable: parent.tn,
              parentColumn: parentPK.cn,
              type: 'real'
            };
            const rel2Args = {
              ...req.body,
              childTable: aTn,
              childColumn: childCn,
              parentTable: child.tn,
              parentColumn: childPK.cn,
              type: 'real'
            };

            await sqlMgr.sqlOpPlus(base, 'relationCreate', rel1Args);
            await sqlMgr.sqlOpPlus(base, 'relationCreate', rel2Args);

            const parentCol = (await assocModel.getColumns())?.find(
              c => c.cn === parentCn
            );
            const childCol = (await assocModel.getColumns())?.find(
              c => c.cn === childCn
            );

            await Column.insert({
              _cn: getUniqueColumnAliasName(
                await child.getColumns(),
                req.body._cn ?? `${child._tn}List`
              ),
              uidt: UITypes.LinkToAnotherRecord,
              type: 'mm',

              // ref_db_alias
              fk_model_id: child.id,
              // db_type:

              fk_child_column_id: childPK.id,
              fk_parent_column_id: parentPK.id,

              fk_mm_model_id: assocModel.id,
              fk_mm_child_column_id: childCol.id,
              fk_mm_parent_column_id: parentCol.id,
              fk_related_table_id: child.id
            });
            await Column.insert({
              _cn: getUniqueColumnAliasName(
                await parent.getColumns(),
                `${parent._tn}List`
              ),

              uidt: UITypes.LinkToAnotherRecord,
              type: 'mm',

              fk_model_id: parent.id,

              fk_child_column_id: parentPK.id,
              fk_parent_column_id: childPK.id,

              fk_mm_model_id: assocModel.id,
              fk_mm_child_column_id: parentCol.id,
              fk_mm_parent_column_id: childCol.id,
              fk_related_table_id: parent.id
            });
          }
        }
        break;

      case UITypes.Formula:
        colBody.formula = await substituteColumnNameWithIdInFormula(
          colBody.formula,
          table.columns
        );
        await Column.insert({
          ...colBody,
          fk_model_id: table.id
        });

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
          await Column.insert({
            ...colBody,
            fk_model_id: table.id
          });
        }
        break;
    }

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
