import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import Column from './Column';
import Model from './Model';
import NocoCache from '../noco-cache/NocoCache';

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

  public async getChildColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_child_column_id });
  }

  public async getMMChildColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_mm_child_column_id });
  }

  public async getParentColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_parent_column_id });
  }
  public async getMMParentColumn(): Promise<Column> {
    return Column.get({ colId: this.fk_mm_parent_column_id });
  }
  public async getMMModel(): Promise<Model> {
    return Model.get({ id: this.fk_mm_model_id });
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
    let colData = await NocoCache.getOne(`${columnId}_ln*`);
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        'nc_col_relations_v2',
        { fk_column_id: columnId }
      );
      await NocoCache.set(`${columnId}_${colData.id}`, colData);
    }
    return colData ? new LinkToAnotherRecordColumn(colData) : null;
  }

  id: string;
}
