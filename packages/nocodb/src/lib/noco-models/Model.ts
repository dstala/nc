import Noco from '../../lib/noco/Noco';
import Column from './Column';
import NcModel from '../../types/NcModel';
import NocoCache from '../noco-cache/NocoCache';
import { XKnex } from '../dataMapper';
import { BaseModelSqlv2 } from '../dataMapper/lib/sql/BaseModelSqlv2';
import genRollupSelectv2 from '../dataMapper/lib/sql/genRollupSelectv2';
import RollupColumn from './RollupColumn';

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

  columns: Column[];

  // private static baseModels: {
  //   [baseId: string]: {
  //     [dbAlias: string]: {
  //       [tableIdOrName: string]: BaseModelSqlv2;
  //     };
  //   };
  // } = {};

  constructor(data: NcModel) {
    Object.assign(this, data);
  }

  // @ts-ignore
  public async getColumns(force = false): Promise<Column[]> {
    this.columns = await Column.list({
      base_id: this.base_id,
      db_alias: this.db_alias,
      fk_model_id: this.id
    });
    return this.columns;
  }

  public get pk(): Column {
    return this.columns?.find(c => c.pk);
  }
  public get pv(): Column {
    return this.columns?.find(c => c.pv);
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
    let modelList = await NocoCache.getv2(project_id);
    if (!modelList.length) {
      modelList = await Noco.ncMeta.metaList2(
        project_id,
        db_alias,
        'nc_models_v2'
      );

      for (const model of modelList) {
        await NocoCache.setv2(model.id, project_id, model);
      }
    }

    return modelList.map(m => new Model(m));
  }

  public async selectObject(args: {
    knex: XKnex;
    qb?: any;
  }): Promise<{ [name: string]: string }> {
    const res = {};
    const columns = await this.getColumns();
    for (const column of columns) {
      switch (column.uidt) {
        case 'LinkToAnotherRecord':
        case 'Lookup':
        case 'Formula':
          break;
        case 'Rollup':
          args?.qb?.select(
            (
              await genRollupSelectv2({
                // tn: this.title,
                knex: args.knex,
                // column,
                columnOptions: (await column.getColOptions()) as RollupColumn
              })
            ).builder.as(column._cn)
          );
          break;
        default:
          res[column._cn] = `${this.title}.${column.cn}`;
          break;
      }
    }
    return res;
  }

  public static async clear({ id }: { id: string }): Promise<void> {
    await NocoCache.delAll(`*_${id}`);
    await Column.clearList({ fk_model_id: id });
  }

  public static async get({
    base_id,
    db_alias,
    tn,
    id
  }: {
    base_id?: string;
    db_alias?: string;
    tn?: string;
    id?: string;
  }): Promise<Model> {
    let modelData = null; //id && (await NocoCache.get(id));
    if (!modelData) {
      modelData = await Noco.ncMeta.metaGet2(
        base_id,
        db_alias,
        'nc_models_v2',
        id || {
          title: tn
        }
      );
      await NocoCache.setv2(id, modelData?.base_id, modelData);
      // if (
      //   this.baseModels?.[modelData.base_id]?.[modelData.db_alias]?.[
      //     modelData.title
      //   ]
      // ) {
      //   delete this.baseModels[modelData.base_id][modelData.db_alias][
      //     modelData.title
      //   ];
      // }
      // if (
      //   this.baseModels?.[modelData.base_id]?.[modelData.db_alias]?.[
      //     modelData.id
      //   ]
      // ) {
      //   delete this.baseModels[modelData.base_id][modelData.db_alias][
      //     modelData.id
      //   ];
      // }
    }
    if (modelData) {
      return new Model(modelData);
    }
    return null;
  }

  public static async getBaseModelSQL(args: {
    id?: string;
    tn?: string;
    dbDriver: XKnex;
    model?: Model;
  }): Promise<BaseModelSqlv2> {
    const model =
      args?.model ||
      (await this.get({
        id: args.id,
        tn: args.tn
      }));

    // if (
    //   this.baseModels?.[model.base_id]?.[model.db_alias]?.[args.tn || args.id]
    // ) {
    //   return this.baseModels[model.base_id][model.db_alias][args.tn || args.id];
    // }
    // this.baseModels[model.base_id] = this.baseModels[model.base_id] || {};
    // this.baseModels[model.base_id][model.db_alias] =
    //   this.baseModels[model.base_id][model.db_alias] || {};
    // return (this.baseModels[model.base_id][model.db_alias][
    //   args.tn || args.id
    // ] = new BaseModelSqlv2({
    //   dbDriver: args.dbDriver,
    //   model
    // }));

    return new BaseModelSqlv2({
      dbDriver: args.dbDriver,
      model
    });
  }
}
