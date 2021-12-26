import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';

export default class LinkToAnotherRecordColumn {
  fk_column_id?: string;
  fk_child_column_id?: string;
  fk_parent_column_id?: string;
  fk_mm_model_id?: string;
  fk_mm_child_column_id?: string;
  fk_mm_parent_column_id?: string;
  type: 'hm' | 'bt' | 'mm';
  virtual = false;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_col_relations_v2',
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
      'nc_col_relations_v2',
      { fk_column_id: columnId }
    );

    return column ? new LinkToAnotherRecordColumn(column) : null;
  }

  id: string;
}
