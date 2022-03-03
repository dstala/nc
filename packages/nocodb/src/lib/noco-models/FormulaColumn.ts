import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import NocoCache from '../noco-cache/NocoCache';

export default class FormulaColumn {
  formula: string;
  fk_column_id: string;

  constructor(data: Partial<FormulaColumn>) {
    Object.assign(this, data);
  }

  // TODO: cache
  public static async insert(
    data: Partial<FormulaColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const row = await ncMeta.metaInsert2(null, null, MetaTable.COL_FORMULA, {
      fk_column_id: data.fk_column_id,
      formula: data.formula
    });
    return new FormulaColumn(row);
  }
  public static async read(columnId: string) {
    let column =
      columnId &&
      (await NocoCache.get(
        `${CacheScope.COL_FORMULA}:${columnId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!column) {
      column = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_FORMULA,
        { fk_column_id: columnId }
      );
      await NocoCache.set(`${CacheScope.COL_FORMULA}:${columnId}`, column);
    }

    return column ? new FormulaColumn(column) : null;
  }

  id: string;
}
