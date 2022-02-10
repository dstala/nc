import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import { MetaTable } from '../utils/globals';

export default class FormulaColumn {
  formula: string;
  fk_column_id: string;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      MetaTable.COL_FORMULA,
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
      MetaTable.COL_FORMULA,
      { fk_column_id: columnId }
    );

    return column ? new FormulaColumn(column) : null;
  }

  id: string;
}
