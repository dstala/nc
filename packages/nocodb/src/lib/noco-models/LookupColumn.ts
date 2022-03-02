import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
// import NocoCache from '../noco-cache/NocoCache';
import Column from './Column';
import { CacheGetType, CacheScope, MetaTable } from '../utils/globals';
import NocoCache from '../noco-cache/NocoCache';

export default class LookupColumn {
  fk_relation_column_id: string;
  fk_lookup_column_id: string;

  constructor(data: NcColumn) {
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

  // TODO: Cache
  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.base_id,
      MetaTable.COL_LOOKUP,
      {
        tn: model.tn,
        _tn: model._tn
      }
    );
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
