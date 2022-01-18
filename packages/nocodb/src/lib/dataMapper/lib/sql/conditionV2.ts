import Filter from '../../../noco-models/Filter';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';
import { XKnex } from '../..';
import Column from '../../../noco-models/Column';
import LookupColumn from '../../../noco-models/LookupColumn';
import genRollupSelectv2 from './genRollupSelectv2';
import RollupColumn from '../../../noco-models/RollupColumn';
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

const parseConditionV2 = async (
  filter: Filter,
  knex: XKnex,
  aliasCount = { count: 0 },
  alias?,
  customWhereClause?
) => {
  // const model = await filter.getModel();
  if (filter.is_group) {
    const children = await filter.getChildren();

    const qbs = await Promise.all(
      (children || []).map(child => parseConditionV2(child, knex, aliasCount))
    );

    return qbP => {
      qbP.where(qb => {
        if (filter.logical_op?.toLowerCase() === 'or') {
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
    const column = await filter.getColumn();

    if (column.uidt === UITypes.LinkToAnotherRecord) {
      const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
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
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: childModel.id,
              fk_column_id: childModel?.pv?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(parentColumn.cn, selectQb);
          else qbP.whereIn(parentColumn.cn, selectQb);
        };
      } else if (colOptions.type === 'bt') {
        const selectQb = knex(parentModel.title).select(childColumn.cn);
        (
          await parseConditionV2(
            new Filter({
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.pv?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(childColumn.cn, selectQb);
          else qbP.whereIn(childColumn.cn, selectQb);
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
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.pv?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(childColumn.cn, selectQb);
          else qbP.whereIn(childColumn.cn, selectQb);
        };
      }

      return _qb => {};
    } else if (column.uidt === UITypes.Lookup) {
      return await generateLookupCondition(column, filter, knex, aliasCount);
    } else if (column.uidt === UITypes.Rollup && !customWhereClause) {
      const builder = (
        await genRollupSelectv2({
          knex,
          columnOptions: (await column.getColOptions()) as RollupColumn
        })
      ).builder;
      return parseConditionV2(
        new Filter({ ...filter, value: knex.raw(filter.value) } as any),
        knex,
        aliasCount,
        alias,
        builder
      );
    } else if (column.uidt === UITypes.Formula) {
      // todo:
      return _qb => {};
    } else {
      const field = customWhereClause
        ? filter.value
        : alias
        ? `${alias}.${column.cn}`
        : column.cn;
      const val = customWhereClause ? customWhereClause : filter.value;
      return qb => {
        switch (filter.comparison_op) {
          case 'eq':
            qb = qb.where(field, val);
            break;
          case 'neq':
            qb = qb.whereNot(field, val);
            break;
          case 'like':
            qb = qb.where(field, 'like', val);
            break;
          case 'nlike':
            qb = qb.whereNot(field, 'like', val);
            break;
          case 'gt':
            qb = qb.where(field, '>', val);
            break;
          case 'ge':
            qb = qb.where(field, '>=', val);
            break;
          case 'lt':
            qb = qb.where(field, '<', val);
            break;
          case 'le':
            qb = qb.where(field, '<=', val);
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

const negatedMapping = {
  nlike: { comparison_op: 'like' },
  neq: { comparison_op: 'eq' }
};

function getAlias(aliasCount: { count: number }) {
  return `__nc${aliasCount.count++}`;
}

// todo: refactor child , parent in mm
async function generateLookupCondition(
  col: Column,
  filter: Filter,
  knex,
  aliasCount = { count: 0 }
): Promise<any> {
  const colOptions = await col.getColOptions<LookupColumn>();
  const relationColumn = await colOptions.getRelationColumn();
  const relationColumnOptions = await relationColumn.getColOptions<
    LinkToAnotherRecordColumn
  >();
  // const relationModel = await relationColumn.getModel();
  const lookupColumn = await colOptions.getLookupColumn();
  const alias = getAlias(aliasCount);
  let qb;
  {
    const childColumn = await relationColumnOptions.getChildColumn();
    const parentColumn = await relationColumnOptions.getParentColumn();
    const childModel = await childColumn.getModel();
    await childModel.getColumns();
    const parentModel = await parentColumn.getModel();
    await parentModel.getColumns();

    if (relationColumnOptions.type === 'hm') {
      qb = knex(`${childModel.title} as ${alias}`);

      qb.select(`${alias}.${childColumn.cn}`);

      await nestedConditionJoin(
        {
          ...filter,
          ...(filter.comparison_op in negatedMapping
            ? negatedMapping[filter.comparison_op]
            : {})
        },
        lookupColumn,
        qb,
        knex,
        alias,
        aliasCount
      );

      return (qbP: QueryBuilder) => {
        if (filter.comparison_op in negatedMapping)
          qbP.whereNotIn(parentColumn.cn, qb);
        else qbP.whereIn(parentColumn.cn, qb);
      };
    } else if (relationColumnOptions.type === 'bt') {
      qb = knex(`${parentModel.title} as ${alias}`);
      qb.select(`${alias}.${childColumn.cn}`);

      await nestedConditionJoin(
        {
          ...filter,
          ...(filter.comparison_op in negatedMapping
            ? negatedMapping[filter.comparison_op]
            : {})
        },
        lookupColumn,
        qb,
        knex,
        alias,
        aliasCount
      );

      return (qbP: QueryBuilder) => {
        if (filter.comparison_op in negatedMapping)
          qbP.whereNotIn(childColumn.cn, qb);
        else qbP.whereIn(childColumn.cn, qb);
      };
    } else if (relationColumnOptions.type === 'mm') {
      const mmModel = await relationColumnOptions.getMMModel();
      const mmParentColumn = await relationColumnOptions.getMMParentColumn();
      const mmChildColumn = await relationColumnOptions.getMMChildColumn();

      const childAlias = `__nc${aliasCount.count++}`;

      qb = knex(`${mmModel.title} as ${alias}`)
        .select(`${alias}.${mmChildColumn.cn}`)
        .join(
          `${parentModel.title} as ${childAlias}`,
          `${alias}.${mmParentColumn.cn}`,
          `${childAlias}.${parentColumn.cn}`
        );

      await nestedConditionJoin(
        {
          ...filter,
          ...(filter.comparison_op in negatedMapping
            ? negatedMapping[filter.comparison_op]
            : {})
        },
        lookupColumn,
        qb,
        knex,
        childAlias,
        aliasCount
      );

      return (qbP: QueryBuilder) => {
        if (filter.comparison_op in negatedMapping)
          qbP.whereNotIn(childColumn.cn, qb);
        else qbP.whereIn(childColumn.cn, qb);
      };
    }
  }
}

async function nestedConditionJoin(
  filter: Filter,
  lookupColumn: Column,
  qb: QueryBuilder,
  knex,
  alias: string,
  aliasCount: { count: number }
) {
  if (
    lookupColumn.uidt === UITypes.Lookup ||
    lookupColumn.uidt === UITypes.LinkToAnotherRecord
  ) {
    const relationColumn =
      lookupColumn.uidt === UITypes.Lookup
        ? await (
            await lookupColumn.getColOptions<LookupColumn>()
          ).getRelationColumn()
        : lookupColumn;
    const relationColOptions = await relationColumn.getColOptions<
      LinkToAnotherRecordColumn
    >();
    const relAlias = `__nc${aliasCount.count++}`;

    const childColumn = await relationColOptions.getChildColumn();
    const parentColumn = await relationColOptions.getParentColumn();
    const childModel = await childColumn.getModel();
    await childModel.getColumns();
    const parentModel = await parentColumn.getModel();
    await parentModel.getColumns();
    {
      switch (relationColOptions.type) {
        case 'hm':
          {
            qb.join(
              `${childModel.title} as ${relAlias}`,
              `${alias}.${parentColumn.cn}`,
              `${relAlias}.${childColumn.cn}`
            );
          }
          break;
        case 'bt':
          {
            qb.join(
              `${parentModel.title} as ${relAlias}`,
              `${alias}.${childColumn.cn}`,
              `${relAlias}.${parentColumn.cn}`
            );
          }
          break;
        case 'mm':
          {
            const mmModel = await relationColOptions.getMMModel();
            const mmParentColumn = await relationColOptions.getMMParentColumn();
            const mmChildColumn = await relationColOptions.getMMChildColumn();

            const assocAlias = `__nc${aliasCount.count++}`;

            qb.join(
              `${mmModel.title} as ${assocAlias}`,
              `${assocAlias}.${mmChildColumn.cn}`,
              `${alias}.${childColumn.cn}`
            ).join(
              `${parentModel.title} as ${relAlias}`,
              `${relAlias}.${parentColumn.cn}`,
              `${assocAlias}.${mmParentColumn.cn}`
            );
          }
          break;
      }
    }

    if (lookupColumn.uidt === UITypes.Lookup) {
      await nestedConditionJoin(
        filter,
        await (
          await lookupColumn.getColOptions<LookupColumn>()
        ).getLookupColumn(),
        qb,
        knex,
        relAlias,
        aliasCount
      );
    } else {
      switch (relationColOptions.type) {
        case 'hm':
          {
            (
              await parseConditionV2(
                new Filter({
                  ...filter,
                  fk_model_id: childModel.id,
                  fk_column_id: childModel.pv?.id
                }),
                knex,
                aliasCount,
                relAlias
              )
            )(qb);
          }
          break;
        case 'bt':
          {
            (
              await parseConditionV2(
                new Filter({
                  ...filter,
                  fk_model_id: parentModel.id,
                  fk_column_id: parentModel?.pv?.id
                }),
                knex,
                aliasCount,
                relAlias
              )
            )(qb);
          }
          break;
        case 'mm':
          {
            (
              await parseConditionV2(
                new Filter({
                  ...filter,
                  fk_model_id: parentModel.id,
                  fk_column_id: parentModel.pv?.id
                }),
                knex,
                aliasCount,
                relAlias
              )
            )(qb);
          }
          break;
      }
    }
  } else {
    (
      await parseConditionV2(
        new Filter({
          ...filter,
          fk_model_id: (await lookupColumn.getModel()).id,
          fk_column_id: lookupColumn?.id
        }),
        knex,
        aliasCount,
        alias
      )
    )(qb);
  }
}