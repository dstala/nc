import Noco from '../../lib/noco/Noco';
// import NocoCache from '../noco-cache/NocoCache';
import Column from './Column';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import NocoCache from '../noco-cache/NocoCache';

export default class LookupColumn {
  fk_relation_column_id: string;
  fk_lookup_column_id: string;
  fk_column_id: string;

  constructor(data: Partial<LookupColumn>) {
    Object.assign(this, data);
  }

  public async getRelationColumn(): Promise<Column> {
    return await Column.get({
      colId: this.fk_relation_column_id
    });
  }

  public async getLookupColumn(): Promise<Column> {
    return await Column.get({
      colId: this.fk_lookup_column_id
    });
  }

  public static async insert(
    data: Partial<LookupColumn>,
    ncMeta = Noco.ncMeta
  ) {
    await ncMeta.metaInsert2(null, null, MetaTable.COL_LOOKUP, {
      fk_column_id: data.fk_column_id,
      fk_relation_column_id: data.fk_relation_column_id,
      fk_lookup_column_id: data.fk_lookup_column_id
    });

    await NocoCache.appendToList(
      CacheScope.COL_LOOKUP,
      [data.fk_lookup_column_id],
      `${CacheScope.COL_LOOKUP}:${data.fk_column_id}`
    );

    await NocoCache.appendToList(
      CacheScope.COL_LOOKUP,
      [data.fk_relation_column_id],
      `${CacheScope.COL_LOOKUP}:${data.fk_column_id}`
    );

    return this.read(data.fk_column_id);
  }

  public static async read(columnId: string) {
    let colData =
      columnId &&
      (await NocoCache.get(
        `${CacheScope.COL_LOOKUP}:${columnId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_LOOKUP,
        { fk_column_id: columnId }
      );
      await NocoCache.set(`${CacheScope.COL_LOOKUP}:${columnId}`, colData);
    }
    return colData ? new LookupColumn(colData) : null;
  }

  id: string;
}
