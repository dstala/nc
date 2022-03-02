import Noco from '../../lib/noco/Noco';
import Model from './Model';
import Column from './Column';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import NocoCache from '../noco-cache/NocoCache';

export default class Sort {
  id: string;

  fk_view_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
  project_id?: string;
  base_id?: string;

  constructor(data: Sort | SortObject) {
    Object.assign(this, data);
  }

  public static async deleteAll(viewId: string, ncMeta = Noco.ncMeta) {
    await NocoCache.deepDel(
      CacheScope.SORT,
      `${CacheScope.SORT}:${viewId}`,
      CacheDelDirection.PARENT_TO_CHILD
    );
    await ncMeta.metaDelete(null, null, MetaTable.SORT, {
      fk_view_id: viewId
    });
  }

  public static async insert(sortObj: Partial<Sort>, ncMeta = Noco.ncMeta) {
    const insertObj = {
      fk_view_id: sortObj.fk_view_id,
      fk_column_id: sortObj.fk_column_id,
      direction: sortObj.direction,
      project_id: sortObj.project_id,
      base_id: sortObj.base_id
    };
    if (!(sortObj.project_id && sortObj.base_id)) {
      const model = await Column.get({ colId: sortObj.fk_column_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }

    const { id } = await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.SORT,
      insertObj
    );

    await NocoCache.set(`${CacheScope.SORT}:${id}`, insertObj);

    return this.get(id, ncMeta);
  }

  public getColumn(): Promise<Column> {
    if (!this.fk_column_id) return null;
    return Column.get({
      colId: this.fk_column_id
    });
  }

  public static async list(
    { viewId }: { viewId: string },
    ncMeta = Noco.ncMeta
  ): Promise<Sort[]> {
    if (!viewId) return null;
    let sortList = await NocoCache.getList(CacheScope.SORT, [viewId]);
    if (!sortList.length) {
      sortList = await ncMeta.metaList2(null, null, MetaTable.SORT, {
        condition: { fk_view_id: viewId }
      });
      await NocoCache.setList(CacheScope.SORT, [viewId], sortList);
    }
    return sortList.map(s => new Sort(s));
  }

  public static async update(sortId, body, ncMeta = Noco.ncMeta) {
    // get existing cache
    const key = `${CacheScope.SORT}:${sortId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    // update fk_column_id & direction
    o.fk_column_id = body.fk_column_id;
    o.direction = body.direction;
    // set cache
    await NocoCache.set(key, o);
    // set meta
    await ncMeta.metaUpdate(
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

  public static async delete(sortId: string, ncMeta = Noco.ncMeta) {
    await NocoCache.deepDel(
      CacheScope.SORT,
      `${CacheScope.SORT}:${sortId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.SORT, sortId);
  }

  public static async get(id: any, ncMeta = Noco.ncMeta) {
    let sortData =
      id &&
      (await NocoCache.get(
        `${CacheScope.SORT}:${id}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!sortData) {
      sortData = await ncMeta.metaGet2(null, null, MetaTable.SORT, id);
      await NocoCache.set(`${CacheScope.SORT}:${id}`, sortData);
    }
    return sortData && new Sort(sortData);
  }

  public async getModel(ncMeta = Noco.ncMeta): Promise<Model> {
    return Model.getByIdOrName(
      {
        id: this.fk_view_id
      },
      ncMeta
    );
  }
}

export interface SortObject {
  id?: string;
  fk_view_id: string;
  fk_column_id?: string;
  direction?: 'asc' | 'desc';
}
