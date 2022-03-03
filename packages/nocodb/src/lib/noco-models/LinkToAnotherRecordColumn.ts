import Noco from '../../lib/noco/Noco';
import Column from './Column';
import Model from './Model';
import NocoCache from '../noco-cache/NocoCache';
import { MetaTable } from '../utils/globals';

export default class LinkToAnotherRecordColumn {
  fk_column_id?: string;
  fk_child_column_id?: string;
  fk_parent_column_id?: string;
  fk_mm_model_id?: string;
  fk_mm_child_column_id?: string;
  fk_mm_parent_column_id?: string;
  fk_related_model_id?: string;

  dr?: string;
  ur?: string;
  fk_index_name?: string;

  type: 'hm' | 'bt' | 'mm';
  virtual = false;

  mmModel?: Model;
  relatedTable?: Model;
  // childModel?: Model;
  // parentModel?: Model;
  mmChildColumn?: Column;
  mmParentColumn?: Column;
  childColumn?: Column;
  parentColumn?: Column;

  constructor(data: Partial<LinkToAnotherRecordColumn>) {
    Object.assign(this, data);
  }

  public async getChildColumn(): Promise<Column> {
    return (this.childColumn = await Column.get({
      colId: this.fk_child_column_id
    }));
  }

  public async getMMChildColumn(): Promise<Column> {
    return (this.mmChildColumn = await Column.get({
      colId: this.fk_mm_child_column_id
    }));
  }

  public async getParentColumn(): Promise<Column> {
    return (this.parentColumn = await Column.get({
      colId: this.fk_parent_column_id
    }));
  }
  public async getMMParentColumn(): Promise<Column> {
    return (this.mmParentColumn = await Column.get({
      colId: this.fk_mm_parent_column_id
    }));
  }
  public async getMMModel(): Promise<Model> {
    return (this.mmModel = await Model.getByIdOrName({
      id: this.fk_mm_model_id
    }));
  }
  public async getRelatedTable(): Promise<Model> {
    return (this.relatedTable = await Model.getByIdOrName({
      id: this.fk_related_model_id
    }));
  }

  public static async insert(
    data: Partial<LinkToAnotherRecordColumn>,
    ncMeta = Noco.ncMeta
  ) {
    const row = await ncMeta.metaInsert2(null, null, MetaTable.COL_RELATIONS, {
      fk_column_id: data.fk_column_id,

      // ref_db_alias
      type: data.type,
      // db_type:

      fk_child_column_id: data.fk_child_column_id,
      fk_parent_column_id: data.fk_parent_column_id,

      fk_mm_model_id: data.fk_mm_model_id,
      fk_mm_child_column_id: data.fk_mm_child_column_id,
      fk_mm_parent_column_id: data.fk_mm_parent_column_id,

      ur: data.ur,
      dr: data.dr,

      fk_index_name: data.fk_index_name,
      fk_related_model_id: data.fk_related_model_id
    });
    return new LinkToAnotherRecordColumn(row);
  }

  public static async read(columnId: string) {
    let colData = (await NocoCache.getv2(columnId))?.[0];
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_RELATIONS,
        { fk_column_id: columnId }
      );
      await NocoCache.setv2(colData?.id, columnId, colData);
    }
    return colData ? new LinkToAnotherRecordColumn(colData) : null;
  }

  id: string;
}
