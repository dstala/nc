import Noco from '../../lib/noco/Noco';
import { MetaTable } from '../utils/globals';

export default class FormulaColumn {
  formula: string;
  formula_raw: string;
  fk_column_id: string;

  constructor(data: Partial<FormulaColumn>) {
    Object.assign(this, data);
  }

  public static async insert(
    data: Partial<FormulaColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const row = await ncMeta.metaInsert2(null, null, MetaTable.COL_FORMULA, {
      fk_column_id: data.fk_column_id,
      formula_raw: data.formula_raw,
      formula: data.formula
    });
    return new FormulaColumn(row);
  }
  public static async read(columnId: string) {
    const column = await Noco.ncMeta.metaGet2(
      null, //,
      null, //model.db_alias,
      MetaTable.COL_FORMULA,
      { fk_column_id: columnId }
    );

    return column ? new FormulaColumn(column) : null;
  }

  id: string;
}
