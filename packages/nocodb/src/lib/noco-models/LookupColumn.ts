import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import NocoCache from '../noco-cache/NocoCache';

export default class LookupColumn {
  fk_relation_column_id: string;
  fk_lookup_column_id: string;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_col_lookup_v2',
      {
        tn: model.tn,
        _tn: model._tn
      }
    );
  }

  public static async read(columnId: string) {
    let colData = (await NocoCache.getv2(columnId))?.[0];
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        null, //,
        null, //model.db_alias,
        'nc_col_lookup_v2',
        { fk_column_id: columnId }
      );
      await NocoCache.setv2(colData.id, columnId, colData);
    }
    return colData ? new LookupColumn(colData) : null;
  }

  id: string;
}
