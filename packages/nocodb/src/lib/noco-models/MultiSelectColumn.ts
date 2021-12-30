import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import NocoCache from '../noco-cache/NocoCache';

export default class MultiSelectColumn {
  title: string;

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
    let options = await NocoCache.getAll(`${columnId}_sl_*`);
    if (!options.length) {
      options = await Noco.ncMeta.metaList2(
        null, //,
        null, //model.db_alias,
        'nc_col_select_options_v2',
        { condition: { fk_column_id: columnId } }
      );
      for (const option of options)
        await NocoCache.set(`${columnId}_${option.id}`, option);
    }

    return options?.length
      ? {
          options: options.map(c => new MultiSelectColumn(c))
        }
      : null;
  }

  id: string;
}
