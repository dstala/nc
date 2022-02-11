import { QueryBuilder } from 'knex';
import { XKnex } from '../..';
import Sort from '../../../noco-models/Sort';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import genRollupSelectv2 from './genRollupSelectv2';
import RollupColumn from '../../../noco-models/RollupColumn';
import LookupColumn from '../../../noco-models/LookupColumn';
import formulaQueryBuilderv2 from './formulav2/formulaQueryBuilderv2';
import FormulaColumn from '../../../noco-models/FormulaColumn';

export default async function sortV2(
  sortList: Sort[],
  qb: QueryBuilder,
  knex: XKnex
) {
  if (!sortList?.length) {
    return;
  }

  for (const sort of sortList) {
    const column = await sort.getColumn();
    if (!column) continue;
    const model = await column.getModel();
    switch (column.uidt) {
      case UITypes.Rollup:
        {
          const builder = (
            await genRollupSelectv2({
              knex,
              columnOptions: (await column.getColOptions()) as RollupColumn
            })
          ).builder;

          qb.orderBy(builder, sort.direction || 'asc');
        }
        break;
      case UITypes.Formula:
        {
          const builder = (
            await formulaQueryBuilderv2(
              (await column.getColOptions<FormulaColumn>()).formula,
              null,
              knex,
              model
            )
          ).builder;
          qb.orderBy(builder, sort.direction || 'asc');
        }
        break;
      case UITypes.Lookup:
        {
          {
            let aliasCount = 0,
              selectQb;
            const alias = `__nc_sort${aliasCount++}`;
            const lookup = await column.getColOptions<LookupColumn>();
            {
              const relationCol = await lookup.getRelationColumn();
              const relation = await relationCol.getColOptions<
                LinkToAnotherRecordColumn
              >();
              if (relation.type !== 'bt') return;

              const childColumn = await relation.getChildColumn();
              const parentColumn = await relation.getParentColumn();
              const childModel = await childColumn.getModel();
              await childModel.getColumns();
              const parentModel = await parentColumn.getModel();
              await parentModel.getColumns();

              selectQb = knex(`${parentModel.tn} as ${alias}`).where(
                `${alias}.${parentColumn.cn}`,
                knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
              );
            }
            let lookupColumn = await lookup.getLookupColumn();
            let prevAlias = alias;
            while (lookupColumn.uidt === UITypes.Lookup) {
              const nestedAlias = `__nc_sort${aliasCount++}`;
              const nestedLookup = await lookupColumn.getColOptions<
                LookupColumn
              >();
              const relationCol = await nestedLookup.getRelationColumn();
              const relation = await relationCol.getColOptions<
                LinkToAnotherRecordColumn
              >();
              // if any of the relation in nested lookup is
              // not belongs to then ignore the sort option
              if (relation.type !== 'bt') return;

              const childColumn = await relation.getChildColumn();
              const parentColumn = await relation.getParentColumn();
              const childModel = await childColumn.getModel();
              await childModel.getColumns();
              const parentModel = await parentColumn.getModel();
              await parentModel.getColumns();

              selectQb.join(
                `${parentModel.tn} as ${nestedAlias}`,
                `${nestedAlias}.${parentColumn.cn}`,
                `${prevAlias}.${childColumn.cn}`
              );

              lookupColumn = await nestedLookup.getLookupColumn();
              prevAlias = nestedAlias;
            }

            switch (lookupColumn.uidt) {
              case UITypes.Rollup:
                {
                  const builder = (
                    await genRollupSelectv2({
                      knex,
                      columnOptions: (await lookupColumn.getColOptions()) as RollupColumn
                    })
                  ).builder;
                  selectQb.select(builder);
                }
                break;
              case UITypes.LinkToAnotherRecord:
                {
                  const nestedAlias = `__nc_sort${aliasCount++}`;
                  const relation = await lookupColumn.getColOptions<
                    LinkToAnotherRecordColumn
                  >();
                  if (relation.type !== 'bt') return;

                  const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
                  const childColumn = await colOptions.getChildColumn();
                  const parentColumn = await colOptions.getParentColumn();
                  const childModel = await childColumn.getModel();
                  await childModel.getColumns();
                  const parentModel = await parentColumn.getModel();
                  await parentModel.getColumns();

                  selectQb
                    .join(
                      `${parentModel.tn} as ${nestedAlias}`,
                      `${nestedAlias}.${parentColumn.cn}`,
                      `${prevAlias}.${childColumn.cn}`
                    )
                    .select(parentModel?.primaryValue?.cn);
                }
                break;
              case UITypes.Formula:
                {
                  const builder = (
                    await formulaQueryBuilderv2(
                      (await column.getColOptions<FormulaColumn>()).formula,
                      null,
                      knex,
                      model
                    )
                  ).builder;

                  selectQb.select(builder);
                }
                break;
              default:
                {
                  selectQb.select(`${prevAlias}.${lookupColumn.cn}`);
                }

                break;
            }

            qb.orderBy(selectQb, sort.direction || 'asc');
          }
        }
        break;
      case UITypes.LinkToAnotherRecord:
        {
          const relation = await column.getColOptions<
            LinkToAnotherRecordColumn
          >();
          if (relation.type !== 'bt') return;

          const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
          const childColumn = await colOptions.getChildColumn();
          const parentColumn = await colOptions.getParentColumn();
          const childModel = await childColumn.getModel();
          await childModel.getColumns();
          const parentModel = await parentColumn.getModel();
          await parentModel.getColumns();

          const selectQb = knex(parentModel.tn)
            .select(parentModel?.primaryValue?.cn)
            .where(
              `${parentModel.tn}.${parentColumn.cn}`,
              knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
            );

          qb.orderBy(selectQb, sort.direction || 'asc');
        }
        break;
      default:
        qb.orderBy(`${column.cn}`, sort.direction || 'asc');
        break;
    }
  }
}
