import Noco from '../../lib/noco/Noco';
import Model from './Model';
import Column from './Column';

export default class Sort {
  id: string;

  fk_model_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';

  constructor(data: Sort | SortObject) {
    Object.assign(this, data);
  }

  public async getModel(): Promise<Model> {
    return Model.get({
      id: this.fk_model_id
    });
  }

  public static async insert(model: Partial<SortObject>) {
    await Noco.ncMeta.metaInsert2(null, null, 'nc_sort_v2', {
      fk_model_id: model.fk_model_id,
      fk_column_id: model.fk_column_id,
      direction: model.direction
    });
  }

  public static async deleteAll(modelId: string) {
    await Noco.ncMeta.metaDelete(null, null, 'nc_sort_v2', {
      fk_model_id: modelId
    });
  }

  public getColumn(): Promise<Column> {
    if (!this.fk_column_id) return null;
    return Column.get({
      colId: this.fk_column_id
    });
  }

  public static async list({
    base_id,
    db_alias,
    modelId
  }: {
    base_id?: string;
    db_alias?: string;
    modelId: string;
  }): Promise<Sort[]> {
    const sortList = await Noco.ncMeta.metaList2(
      base_id,
      db_alias,
      'nc_sort_v2',
      { condition: { fk_model_id: modelId } }
    );
    return sortList.map(s => new Sort(s));
  }
}

export interface SortObject {
  id?: string;
  fk_model_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
}
