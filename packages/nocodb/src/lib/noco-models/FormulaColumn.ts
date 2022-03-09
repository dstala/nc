import Noco from '../../lib/noco/Noco';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import NocoCache from '../noco-cache/NocoCache';
import extractProps from '../noco/meta/api/helpers/extractProps';

export default class FormulaColumn {
  formula: string;
  formula_raw: string;
  fk_column_id: string;
  error: string;

  constructor(data: Partial<FormulaColumn>) {
    Object.assign(this, data);
  }

  public static async insert(
    data: Partial<FormulaColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const { id } = await ncMeta.metaInsert2(null, null, MetaTable.COL_FORMULA, {
      fk_column_id: data.fk_column_id,
      formula_raw: data.formula_raw,
      formula: data.formula,
      error: data.error
    });

    return this.read(id);
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

  static async update(
    id: string,
    formula: Partial<FormulaColumn>,
    ncMeta = Noco.ncMeta
  ) {
    // todo: redis del/update - verify
    await NocoCache.del(`${CacheScope.COL_FORMULA}:${formula.fk_column_id}`);
    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.COL_FORMULA,
      extractProps(formula, [
        'formula',
        'formula_raw',
        'fk_column_id',
        'error'
      ]),
      id
    );
  }
}
