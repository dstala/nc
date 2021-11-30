import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import UITypes from '../sqlUi/UITypes';

export default class Column implements NcColumn {
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

  public static async insert(model: NcColumn) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_columns',
      model
    );
  }
  public static async list({
    project_id,
    db_alias,
    condition
  }: {
    project_id: string;
    db_alias: string;
    condition: any;
  }): Promise<Column[]> {
    return (
      await Noco.ncMeta.metaList2(project_id, db_alias, 'nc_columns', {
        condition
      })
    ).map(m => new Column(m));
  }

  id: string;
}
