import { QueryBuilder } from 'knex';
import { XKnex } from '../..';
import Sort from '../../../noco-models/Sort';
import UITypes from '../../../sqlUi/UITypes';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import genRollupSelectv2 from './genRollupSelectv2';
import RollupColumn from '../../../noco-models/RollupColumn';
// import LookupColumn from '../../../noco-models/LookupColumn';

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
      case UITypes.Lookup:
        {
          /*   {

            let selectQb;
            let lookupColumn = column;

            const lookup = await column.getColOptions<LookupColumn>();
            const relation = await lookup.getRelationColumn();
            if (relation.type !== 'bt') return;

            do {
              const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
              const childColumn = await colOptions.getChildColumn();
              const parentColumn = await colOptions.getParentColumn();
              const childModel = await childColumn.getModel();
              await childModel.getColumns();
              const parentModel = await parentColumn.getModel();
              await parentModel.getColumns();

              selectQb = knex(parentModel.title)
                .select(parentModel?.pv?.cn)
                .where(
                  `${parentModel.title}.${parentColumn.cn}`,
                  knex.raw(`??`, [`${childModel.title}.${childColumn.cn}`])
                );

              qb.orderBy(selectQb, sort.direction || 'asc');
            }while()
          }*/
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

          const selectQb = knex(parentModel.title)
            .select(parentModel?.pv?.cn)
            .where(
              `${parentModel.title}.${parentColumn.cn}`,
              knex.raw(`??`, [`${childModel.title}.${childColumn.cn}`])
            );

          qb.orderBy(selectQb, sort.direction || 'asc');
        }
        break;
      case UITypes.Formula:
        break;
      default:
        qb.orderBy(`${column.cn}`, sort.direction || 'asc');
        break;
    }
  }
}
