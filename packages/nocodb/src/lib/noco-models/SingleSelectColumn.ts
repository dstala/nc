import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import UITypes from '../sqlUi/UITypes';
import NocoCache from '../noco-cache/NocoCache';
import { MetaTable } from '../utils/globals';

export default class SingleSelectColumn implements NcColumn {
  _cn: string;
  ai: boolean;
  au: boolean;
  cc: string;
  clen: number | string;
  cn: string;
  cop: number | string;
  created_at: Date | number | string;
  csn: string;
  ct: string;
  ctf: any;
  db_alias: 'db' | string;
  deleted: boolean;
  dt: string;
  dtx: string;
  dtxp: string | number;
  dtxs: string | number;
  model_id: string;
  np: number | string;
  ns: number | string;
  order: number;
  pk: boolean;
  project_id: string;
  rqd: boolean;
  uidt: UITypes;
  un: boolean;
  unique: boolean;
  updated_at: Date | number | string;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      MetaTable.COL_SELECT_OPTIONS,
      {
        tn: model.tn,
        _tn: model._tn
      }
    );
  }

  public static async read(columnId: string) {
    let options = await NocoCache.getAll(`${columnId}_sl_*`);
    if (!options.length) {
      options = await Noco.ncMeta.metaList2(
        null, //,
        null, //model.db_alias,
        MetaTable.COL_SELECT_OPTIONS,
        { condition: { fk_column_id: columnId } }
      );
      for (const option of options)
        await NocoCache.set(`${columnId}_${option.id}`, option);
    }

    return options?.length
      ? {
          options: options.map(c => new SingleSelectColumn(c))
        }
      : null;
  }

  id: string;
}
