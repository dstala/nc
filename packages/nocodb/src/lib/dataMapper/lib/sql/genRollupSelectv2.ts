import RollupColumn from '../../../noco-models/RollupColumn';
import { XKnex } from '../..';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';

export default async function({
  knex,
  // tn,
  // column,
  alias,
  columnOptions
}: {
  knex: XKnex;
  alias?: string;
  columnOptions: RollupColumn;
}): Promise<{ builder: QueryBuilder | any }> {
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
            knex.ref(`${childModel?.title}.${rollupColumn.title}`)
          )
          .where(
            knex.ref(`${alias || parentModel.title}.${parentCol.title}`),
            '=',
            knex.ref(`${childModel.title}.${childCol.title}`)
          )
      };
    case 'mm': {
      const mmModel = await relationColumnOption.getMMModel();
      const mmChildCol = await relationColumnOption.getMMChildColumn();
      const mmParentCol = await relationColumnOption.getMMParentColumn();

      return {
        builder: knex(parentModel.title)
          [columnOptions.rollup_function]?.(
            knex.ref(`${parentModel.title}.${rollupColumn.title}`)
          )
          .innerJoin(
            mmModel.title,
            knex.ref(`${mmModel.title}.${mmParentCol.title}`),
            '=',
            knex.ref(`${parentModel.title}.${parentCol.title}`)
          )
          .where(
            knex.ref(`${mmModel.title}.${mmChildCol.title}`),
            '=',
            knex.ref(`${alias || childModel.title}.${childCol.title}`)
          )
      };
    }

    default:
      throw Error(`Unsupported relation type '${relationColumnOption.type}'`);
  }
}
