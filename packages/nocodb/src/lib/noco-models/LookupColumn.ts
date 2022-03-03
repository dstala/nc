import Noco from '../../lib/noco/Noco';
import NocoCache from '../noco-cache/NocoCache';
import Column from './Column';
import { MetaTable } from '../utils/globals';

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
    const row = await ncMeta.metaInsert2(null, null, MetaTable.COL_LOOKUP, {
      fk_column_id: data.fk_column_id,
      fk_relation_column_id: data.fk_relation_column_id,
      fk_lookup_column_id: data.fk_lookup_column_id
    });
    return new LookupColumn(row);
  }

  public static async read(columnId: string) {
    let colData = (await NocoCache.getv2(columnId))?.[0];
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_LOOKUP,
        { fk_column_id: columnId }
      );
      await NocoCache.setv2(colData.id, columnId, colData);
    }
    return colData ? new LookupColumn(colData) : null;
  }

  id: string;
}
