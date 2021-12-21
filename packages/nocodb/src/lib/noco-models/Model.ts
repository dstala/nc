import Noco from '../../lib/noco/Noco';
import Column from './Column';
import NcModel from '../../types/NcModel';

export default class Model implements NcModel {
  copy_enabled: boolean;
  created_at: Date | number | string;
  db_alias: 'db' | string;
  base_id: string;
  deleted: boolean;
  enabled: boolean;
  export_enabled: boolean;
  id: string;
  order: number;
  parent_id: string;
  password: string;
  pin: boolean;
  project_id: string;
  schema: any;
  show_all_fields: boolean;
  tags: string;
  title: string;
  type: 'table' | 'view' | 'grid' | 'form' | 'kanban' | 'calendar' | 'gantt';
  updated_at: Date | number | string;
  alias: string;

  uuid: string;

  private _columns: Column[];

  constructor(data: NcModel) {
    Object.assign(this, data);
  }

  public get columns(): Promise<Column[]> {
    return new Promise<Column[]>((resolve, reject) => {
      if (this._columns) return resolve(this._columns);
      Column.list({
        base_id: this.base_id,
        db_alias: this.db_alias,
        condition: {
          model_id: this.id
        }
      })
        .then(resolve)
        .catch(reject);
    });
  }

  public static async insert(model: NcModel) {
    await Noco.ncMeta.metaInsert2(
      model.base_id,
      model.db_alias,
      'nc_models_v2',
      model
    );
  }

  public static async list({
    project_id,
    db_alias
  }: {
    project_id: string;
    db_alias: string;
  }): Promise<Model[]> {
    return (
      await Noco.ncMeta.metaList2(project_id, db_alias, 'nc_models_v2')
    ).map(m => new Model(m));
  }

  public static async get({
    base_id,
    db_alias,
    tn
  }: {
    base_id: string;
    db_alias: string;
    tn: string;
  }): Promise<Model> {
    const m = await Noco.ncMeta.metaGet2(base_id, db_alias, 'nc_models_v2', {
      title: tn
    });
    return m && new Model(m);
  }
}
