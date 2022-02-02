import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import Column from './Column';

export default class RollupColumn {
  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_col_rollup_v2',
      {
        tn: model.tn,
        _tn: model._tn
      }
    );
  }

  public static async read(columnId: string) {
    const column = await Noco.ncMeta.metaGet2(
      null, //,
      null, //model.db_alias,
      'nc_col_rollup_v2',
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

  fk_column_id;
  fk_relation_column_id;
  fk_rollup_column_id;

  rollup_function: string;

  id: string;
}