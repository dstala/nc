import Filter from '../../../noco-models/Filter';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';
import { XKnex } from '../..';
import Column from '../../../noco-models/Column';
import LookupColumn from '../../../noco-models/LookupColumn';
import genRollupSelectv2 from './genRollupSelectv2';
import RollupColumn from '../../../noco-models/RollupColumn';
import formulaQueryBuilderv2 from './formulav2/formulaQueryBuilderv2';
import FormulaColumn from '../../../noco-models/FormulaColumn';
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

    if (column.ui_data_type === UITypes.LinkToAnotherRecord) {
      const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
      const childColumn = await colOptions.getChildColumn();
      const parentColumn = await colOptions.getParentColumn();
      const childModel = await childColumn.getModel();
      await childModel.getColumns();
      const parentModel = await parentColumn.getModel();
      await parentModel.getColumns();
      if (colOptions.type === 'hm') {
        const selectQb = knex(childModel.title).select(childColumn.title);
        (
          await parseConditionV2(
            new Filter({
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: childModel.id,
              fk_column_id: childModel?.primaryValue?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(parentColumn.title, selectQb);
          else qbP.whereIn(parentColumn.title, selectQb);
        };
      } else if (colOptions.type === 'bt') {
        const selectQb = knex(parentModel.title).select(childColumn.title);
        (
          await parseConditionV2(
            new Filter({
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.primaryValue?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(childColumn.title, selectQb);
          else qbP.whereIn(childColumn.title, selectQb);
        };
      } else if (colOptions.type === 'mm') {
        const mmModel = await colOptions.getMMModel();
        const mmParentColumn = await colOptions.getMMParentColumn();
        const mmChildColumn = await colOptions.getMMChildColumn();

        const selectQb = knex(mmModel.title)
          .select(mmChildColumn.title)
          .join(
            parentModel.title,
            `${mmModel.title}.${mmParentColumn.title}`,
            `${parentModel.title}.${parentColumn.title}`
          );
        (
          await parseConditionV2(
            new Filter({
              ...filter,
              ...(filter.comparison_op in negatedMapping
                ? negatedMapping[filter.comparison_op]
                : {}),
              fk_model_id: parentModel.id,
              fk_column_id: parentModel?.primaryValue?.id
            }),
            knex,
            aliasCount
          )
        )(selectQb);

        return (qbP: QueryBuilder) => {
          if (filter.comparison_op in negatedMapping)
            qbP.whereNotIn(childColumn.title, selectQb);
          else qbP.whereIn(childColumn.title, selectQb);
        };
      }

      return _qb => {};
    } else if (column.ui_data_type === UITypes.Lookup) {
      return await generateLookupCondition(column, filter, knex, aliasCount);
    } else if (column.ui_data_type === UITypes.Rollup && !customWhereClause) {
      const builder = (
        await genRollupSelectv2({
          knex,
          alias,
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
    } else if (column.ui_data_type === UITypes.Formula && !customWhereClause) {
      const model = await column.getModel();
      const builder = (
        await formulaQueryBuilderv2(
          (await column.getColOptions<FormulaColumn>()).formula,
          null,
          knex,
          model
        )
      ).builder;
      return parseConditionV2(
        new Filter({ ...filter, value: knex.raw(filter.value) } as any),
        knex,
        aliasCount,
        alias,
        builder
      );
    } else {
      const field = customWhereClause
        ? filter.value
        : alias
        ? `${alias}.${column.title}`
        : column.title;
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
            qb = qb.where(
              field,
              qb?.client?.config?.client === 'pg' ? 'ilike' : 'like',
              val
            );
            break;
          case 'nlike':
            qb = qb.whereNot(
              field,
              qb?.client?.config?.client === 'pg' ? 'ilike' : 'like',
              val
            );
            break;
          case 'gt':
            qb = qb.where(field, customWhereClause ? '<' : '>', val);
            break;
          case 'ge':
            qb = qb.where(field, customWhereClause ? '<=' : '>=', val);
            break;
          case 'lt':
            qb = qb.where(field, customWhereClause ? '>' : '<', val);
            break;
          case 'le':
            qb = qb.where(field, customWhereClause ? '>=' : '<=', val);
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

      qb.select(`${alias}.${childColumn.title}`);

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
          qbP.whereNotIn(parentColumn.title, qb);
        else qbP.whereIn(parentColumn.title, qb);
      };
    } else if (relationColumnOptions.type === 'bt') {
      qb = knex(`${parentModel.title} as ${alias}`);
      qb.select(`${alias}.${childColumn.title}`);

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
          qbP.whereNotIn(childColumn.title, qb);
        else qbP.whereIn(childColumn.title, qb);
      };
    } else if (relationColumnOptions.type === 'mm') {
      const mmModel = await relationColumnOptions.getMMModel();
      const mmParentColumn = await relationColumnOptions.getMMParentColumn();
      const mmChildColumn = await relationColumnOptions.getMMChildColumn();

      const childAlias = `__nc${aliasCount.count++}`;

      qb = knex(`${mmModel.title} as ${alias}`)
        .select(`${alias}.${mmChildColumn.title}`)
        .join(
          `${parentModel.title} as ${childAlias}`,
          `${alias}.${mmParentColumn.title}`,
          `${childAlias}.${parentColumn.title}`
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
          qbP.whereNotIn(childColumn.title, qb);
        else qbP.whereIn(childColumn.title, qb);
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
    lookupColumn.ui_data_type === UITypes.Lookup ||
    lookupColumn.ui_data_type === UITypes.LinkToAnotherRecord
  ) {
    const relationColumn =
      lookupColumn.ui_data_type === UITypes.Lookup
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
              `${alias}.${parentColumn.title}`,
              `${relAlias}.${childColumn.title}`
            );
          }
          break;
        case 'bt':
          {
            qb.join(
              `${parentModel.title} as ${relAlias}`,
              `${alias}.${childColumn.title}`,
              `${relAlias}.${parentColumn.title}`
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
              `${assocAlias}.${mmChildColumn.title}`,
              `${alias}.${childColumn.title}`
            ).join(
              `${parentModel.title} as ${relAlias}`,
              `${relAlias}.${parentColumn.title}`,
              `${assocAlias}.${mmParentColumn.title}`
            );
          }
          break;
      }
    }

    if (lookupColumn.ui_data_type === UITypes.Lookup) {
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
                  fk_column_id: childModel.primaryValue?.id
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
                  fk_column_id: parentModel?.primaryValue?.id
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
                  fk_column_id: parentModel.primaryValue?.id
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
