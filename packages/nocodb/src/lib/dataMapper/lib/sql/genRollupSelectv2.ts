import RollupColumn from '../../../noco-models/RollupColumn';
import { XKnex } from '../..';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import { QueryBuilder } from 'knex';
import { RelationTypes } from 'nc-common';

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
    case RelationTypes.HAS_MANY:
      // if (!rollup.tn || !rollup.rtn) {
      //   rollup = { ...rollup, ...hasMany.find(hm => hm.tn === rollup.rltn) };
      // }
      return {
        builder: knex(childModel?.tn)
          [columnOptions.rollup_function]?.(
            knex.ref(`${childModel?.tn}.${rollupColumn.cn}`)
          )
          .where(
            knex.ref(`${alias || parentModel.tn}.${parentCol.cn}`),
            '=',
            knex.ref(`${childModel.tn}.${childCol.cn}`)
          )
      };
    case RelationTypes.MANY_TO_MANY: {
      const mmModel = await relationColumnOption.getMMModel();
      const mmChildCol = await relationColumnOption.getMMChildColumn();
      const mmParentCol = await relationColumnOption.getMMParentColumn();

      return {
        builder: knex(parentModel.tn)
          [columnOptions.rollup_function]?.(
            knex.ref(`${parentModel.tn}.${rollupColumn.cn}`)
          )
          .innerJoin(
            mmModel.tn,
            knex.ref(`${mmModel.tn}.${mmParentCol.cn}`),
            '=',
            knex.ref(`${parentModel.tn}.${parentCol.cn}`)
          )
          .where(
            knex.ref(`${mmModel.tn}.${mmChildCol.cn}`),
            '=',
            knex.ref(`${alias || childModel.tn}.${childCol.cn}`)
          )
      };
    }

    default:
      throw Error(`Unsupported relation type '${relationColumnOption.type}'`);
  }
}
