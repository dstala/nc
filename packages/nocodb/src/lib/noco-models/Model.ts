import Noco from '../../lib/noco/Noco';
import Column from './Column';
import NcModel from '../../types/NcModel';

export default class Model implements NcModel {
  copy_enabled: boolean;
  created_at: Date | number | string;
  db_alias: 'db' | string;
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
        project_id: this.project_id,
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
      model.project_id,
      model.db_alias,
      'nc_models_2',
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
      await Noco.ncMeta.metaList2(project_id, db_alias, 'nc_models_2')
    ).map(m => new Model(m));
  }
}
