import Filter from '../../../noco-models/Filter';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';
import { XKnex } from '../..';
// import LookupColumn from '../../../noco-models/LookupColumn';

export default async function conditionV2(
  conditionObj: Filter,
  qb: QueryBuilder,
  knex: XKnex
) {
  if (!conditionObj || typeof conditionObj !== 'object') {
    return;
  }
  (await parseConditionV2(conditionObj, knex))(qb);
}

const parseConditionV2 = async (obj: Filter, knex: XKnex) => {
  if (obj.is_group) {
    const children = await obj.getChildren();

    const qbs = await Promise.all(
      (children || []).map(child => parseConditionV2(child, knex))
    );

    return qbP => {
      qbP.where(qb => {
        if (obj.logical_op?.toLowerCase() === 'or') {
          for (const qb1 of qbs) {
            qb.orWhere(qb1);
          }
        } else {
          for (const qb1 of qbs) {
            qb.andWhere(qb1);
          }
        }
      });
    };
  } else {
    const col = await obj.getColumn();

    if (col.uidt === UITypes.LinkToAnotherRecord) {
      const colOptions = (await col.getColOptions()) as LinkToAnotherRecordColumn;
      const childColumn = await colOptions.getChildColumn();
      const parentColumn = await colOptions.getParentColumn();
      const childModel = await childColumn.getModel();
      await childModel.getColumns();
      const parentModel = await parentColumn.getModel();
      await parentModel.getColumns();
      if (colOptions.type === 'hm') {
        const selectQb = knex(childModel.title).select(childColumn.cn);
        (
          await parseConditionV2(
            new Filter({
              ...obj,
              fk_model_id: childModel.id,
              fk_column_id: childModel?.pv?.id
            }),
            knex
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          qbP.whereIn(parentColumn.cn, selectQb);
        };
      } else if (colOptions.type === 'bt') {
        const selectQb = knex(parentModel.title).select(childColumn.cn);
        (
          await parseConditionV2(
            new Filter({
              ...obj,
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.pv?.id
            }),
            knex
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          qbP.whereIn(childColumn.cn, selectQb);
        };
      } else if (colOptions.type === 'mm') {
        const mmModel = await colOptions.getMMModel();
        const mmParentColumn = await colOptions.getMMParentColumn();
        const mmChildColumn = await colOptions.getMMChildColumn();

        const selectQb = knex(mmModel.title)
          .select(mmChildColumn.cn)
          .join(
            parentModel.title,
            `${mmModel.title}.${mmParentColumn.cn}`,
            `${parentModel.title}.${parentColumn.cn}`
          );
        (
          await parseConditionV2(
            new Filter({
              ...obj,
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.pv?.id
            }),
            knex
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          qbP.whereIn(childColumn.cn, selectQb);
        };
      }

      return _qb => {};
    } else if (col.uidt === UITypes.Lookup) {
      console.log(col);

      // const colOptions = (await col.getColOptions()) as LookupColumn;
      // const relationColumn = await colOptions.getRelationColumn();
      // const lookupColumn = await colOptions.getRelationColumn();

      return () => {};
    } else {
      const fieldName = col.cn;
      const val = obj.value;
      return qb => {
        switch (obj.comparison_op) {
          case 'eq':
            qb = qb.where(fieldName, val);
            break;
          case 'neq':
            qb = qb.whereNot(fieldName, val);
            break;
          case 'like':
            qb = qb.where(fieldName, 'like', val);
            break;
          case 'nlike':
            qb = qb.whereNot(fieldName, 'like', val);
            break;
          case 'gt':
            qb = qb.where(fieldName, '>', val);
            break;
          case 'ge':
            qb = qb.where(fieldName, '>=', val);
            break;
          case 'lt':
            qb = qb.where(fieldName, '<', val);
            break;
          case 'le':
            qb = qb.where(fieldName, '<=', val);
            break;
          // case 'in':
          //   qb = qb.whereIn(fieldName, val);
          //   break;
          // case 'nin':
          //   qb = qb.whereNotIn(fieldName, val);
          //   break;
        }
      };
    }
  }
};
