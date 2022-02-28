import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import NocoCache from '../noco-cache/NocoCache';
import { MetaTable } from '../utils/globals';

export default class MultiSelectColumn {
  title: string;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(null, null, MetaTable.COL_SELECT_OPTIONS, {
      tn: model.tn,
      _tn: model._tn
    });
  }

  public static async read(columnId: string) {
    let options; // await NocoCache.getv2(columnId);

    if (!options.length) {
      options = await Noco.ncMeta.metaList2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_SELECT_OPTIONS,
        { condition: { fk_column_id: columnId } }
      );
      for (const option of options)
        await NocoCache.set(option.id, columnId, option);
    }

    return options?.length
      ? {
          options: options.map(c => new MultiSelectColumn(c))
        }
      : null;
  }

  id: string;
}
