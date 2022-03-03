import Noco from '../../lib/noco/Noco';
import Column from './Column';
import { MetaTable } from '../utils/globals';

export default class RollupColumn {
  fk_column_id;
  fk_relation_column_id;
  fk_rollup_column_id;

  rollup_function: string;

  id: string;

  constructor(data: Partial<RollupColumn>) {
    Object.assign(this, data);
  }

  public static async insert(
    data: Partial<RollupColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const row = await ncMeta.metaInsert2(null, null, MetaTable.COL_ROLLUP, {
      fk_column_id: data.fk_column_id,
      fk_relation_column_id: data.fk_relation_column_id,
      fk_rollup_column_id: data.fk_rollup_column_id,
      rollup_function: data.rollup_function
    });
    return new RollupColumn(row);
  }

  public static async read(columnId: string) {
    const column = await Noco.ncMeta.metaGet2(
      null, //,
      null, //model.db_alias,
      MetaTable.COL_ROLLUP,
      { fk_column_id: columnId }
    );

    return column ? new RollupColumn(column) : null;
  }

  public async getRollupColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_rollup_column_id });
  }

  public async getRelationColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_relation_column_id });
  }
}
