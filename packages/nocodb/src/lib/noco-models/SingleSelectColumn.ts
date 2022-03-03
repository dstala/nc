import Noco from '../../lib/noco/Noco';
import NocoCache from '../noco-cache/NocoCache';
import { MetaTable } from '../utils/globals';

export default class SingleSelectColumn {
  title: string;
  fk_column_id: string;

  constructor(data: Partial<SingleSelectColumn>) {
    Object.assign(this, data);
  }

  public static async insert(
    data: Partial<SingleSelectColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const row = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.COL_SELECT_OPTIONS,
      {
        fk_column_id: data.fk_column_id,
        title: data.title
      }
    );
    return new SingleSelectColumn(row);
  }

  public static async read(columnId: string) {
    let options = await NocoCache.getAll(`${columnId}_sl_*`);
    if (!options.length) {
      options = await Noco.ncMeta.metaList2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_SELECT_OPTIONS,
        { condition: { fk_column_id: columnId } }
      );
      for (const option of options)
        await NocoCache.set(`${columnId}_${option.id}`, option);
    }

    return options?.length
      ? {
          options: options.map(c => new SingleSelectColumn(c))
        }
      : null;
  }

  id: string;
}
