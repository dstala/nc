import Noco from '../../lib/noco/Noco';
import Model from './Model';
import Column from './Column';
import { MetaTable } from '../utils/globals';

export default class Sort {
  id: string;

  fk_view_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';

  constructor(data: Sort | SortObject) {
    Object.assign(this, data);
  }

  public static async deleteAll(modelId: string) {
    await Noco.ncMeta.metaDelete(null, null, MetaTable.SORT, {
      fk_view_id: modelId
    });
  }

  public static async insert(model: Partial<SortObject>) {
    const { id } = await Noco.ncMeta.metaInsert2(null, null, MetaTable.SORT, {
      fk_view_id: model.fk_view_id,
      fk_column_id: model.fk_column_id,
      direction: model.direction
    });

    return this.get(id);
  }

  public getColumn(): Promise<Column> {
    if (!this.fk_column_id) return null;
    return Column.get({
      colId: this.fk_column_id
    });
  }

  public static async list({ viewId }: { viewId: string }): Promise<Sort[]> {
    if (!viewId) return null;
    const sortList = await Noco.ncMeta.metaList2(null, null, MetaTable.SORT, {
      condition: { fk_view_id: viewId }
    });
    return sortList.map(s => new Sort(s));
  }

  public static async update(sortId, body) {
    await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.SORT,
      {
        fk_column_id: body.fk_column_id,
        direction: body.direction
      },
      sortId
    );
  }

  public static async delete(sortId: string) {
    await Noco.ncMeta.metaDelete(null, null, MetaTable.SORT, sortId);
  }

  public static async get(id: any) {
    const sortData = await Noco.ncMeta.metaGet2(null, null, MetaTable.SORT, id);
    return new Sort(sortData);
  }

  public async getModel(): Promise<Model> {
    return Model.get({
      id: this.fk_view_id
    });
  }
}

export interface SortObject {
  id?: string;
  fk_view_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
}
