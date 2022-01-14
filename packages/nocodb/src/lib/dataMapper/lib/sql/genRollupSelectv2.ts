import RollupColumn from '../../../noco-models/RollupColumn';
import { XKnex } from '../..';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';

export default async function({
  knex,
  // tn,
  // column,
  columnOptions
}: {
  knex: XKnex;
  columnOptions: RollupColumn;
}): Promise<{ builder: QueryBuilder }> {
  const relationColumn = await columnOptions.getRelationColumn();
  const relationColumnOption: LinkToAnotherRecordColumn = (await relationColumn.getColOptions()) as LinkToAnotherRecordColumn;
  const rollupColumn = await columnOptions.getRollupColumn();
  const childCol = await relationColumnOption.getChildColumn();
  const childModel = await childCol?.getModel();
  const parentCol = await relationColumnOption.getParentColumn();
  const parentModel = await parentCol?.getModel();

  switch (relationColumnOption.type) {
    case 'hm':
      // if (!rollup.tn || !rollup.rtn) {
      //   rollup = { ...rollup, ...hasMany.find(hm => hm.tn === rollup.rltn) };
      // }
      return {
        builder: knex(childModel?.title)
          [columnOptions.rollup_function]?.(
            knex.ref(`${childModel?.title}.${rollupColumn.cn}`)
          )
          .where(
            knex.ref(`${parentModel.title}.${parentCol.cn}`),
            '=',
            knex.ref(`${childModel.title}.${childCol.cn}`)
          )
      };
    case 'mm': {
      const mmModel = await relationColumnOption.getMMModel();
      const mmChildCol = await relationColumnOption.getMMChildColumn();
      const mmParentCol = await relationColumnOption.getMMParentColumn();

      return {
        builder: knex(parentModel.title)
          [columnOptions.rollup_function]?.(
            knex.ref(`${parentModel.title}.${rollupColumn.cn}`)
          )
          .innerJoin(
            mmModel.title,
            knex.ref(`${mmModel.title}.${mmParentCol.cn}`),
            '=',
            knex.ref(`${parentModel.title}.${parentCol.cn}`)
          )
          .where(
            knex.ref(`${mmModel.title}.${mmChildCol.cn}`),
            '=',
            knex.ref(`${childModel.title}.${childCol.cn}`)
          )
      };
    }

    default:
      throw Error(`Unsupported relation type '${relationColumnOption.type}'`);
  }
}
