import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';

export default class MultiSelectColumn {
  name: string;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_columns_v2',
      {
        tn: model.tn,
        _tn: model._tn
      }
    );
  }

  public static async read(columnId: string) {
    const columns = await Noco.ncMeta.metaList2(
      null, //,
      null, //model.db_alias,
      'nc_col_select_options_v2',
      {
        condition: { fk_column_id: columnId }
      }
    );

    return columns?.length
      ? {
          options: columns.map(c => new MultiSelectColumn(c))
        }
      : null;
  }
  id: string;
}
