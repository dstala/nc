import Noco from '../../lib/noco/Noco';
import Column from './Column';
import NcModel from '../../types/NcModel';
import NocoCache from '../noco-cache/NocoCache';
import { XKnex } from '../dataMapper';
import { BaseModelSqlv2 } from '../dataMapper/lib/sql/BaseModelSqlv2';
import Filter from './Filter';
import Sort from './Sort';
import { isVirtualCol, Table, TableReq, ViewTypes } from 'nc-common';
import UITypes from '../sqlUi/UITypes';
import { MetaTable } from '../utils/globals';
import View from './View';
import { Transaction } from 'knex';

export default class Model implements Table {
  copy_enabled: boolean;
  created_at: Date | number | string;
  base_id: 'db' | string;
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
  type: 'table' | 'view' | 'grid' | 'form' | 'kanban' | 'calendar' | 'gantt';
  updated_at: Date | number | string;

  tn: string;
  _tn: string;

  uuid: string;

  columns?: Column[];
  columnsById?: { [id: string]: Column };
  views?: View[];

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
      fk_model_id: this.id
    });
    return this.columns;
  }

  // @ts-ignore
  public async getViews(force = false): Promise<View[]> {
    this.views = await View.listWithInfo(this.id);
    return this.views;
  }

  public get primaryKey(): Column {
    if (!this.columns) return null;
    return this.columns?.find(c => c.pk);
  }

  public get primaryValue(): Column {
    if (!this.columns) return null;
    const pCol = this.columns?.find(c => c.pv);
    if (pCol) return pCol;
    const pkIndex = this.columns.indexOf(this.primaryKey);
    if (pkIndex < this.columns.length - 1) return this.columns[pkIndex + 1];
    return this.columns[0];
  }

  public static async insert(
    projectId,
    baseId,
    model: TableReq,
    _trx?: Transaction
  ) {
    const { id } = await Noco.ncMeta.metaInsert2(
      projectId,
      baseId,
      MetaTable.MODELS,
      {
        tn: model.tn,
        _tn: model._tn,
        order:
          model.order ||
          (await Noco.ncMeta.metaGetNextOrder(MetaTable.FORM_VIEW_COLUMNS, {
            project_id: projectId,
            base_id: baseId
          }))
      }
    );

    const view = await View.insert(
      {
        fk_model_id: id,
        title: model._tn || model.tn,
        is_default: true,
        type: ViewTypes.GRID
      },
      _trx
    );

    for (const column of model?.columns || []) {
      await Column.insert({ ...column, fk_model_id: id, view });
    }

    return this.getWithInfo({ id });
  }

  public static async list({
    project_id,
    base_id
  }: {
    project_id: string;
    base_id: string;
  }): Promise<Model[]> {
    let modelList = []; //await NocoCache.getv2(project_id);
    if (!modelList.length) {
      modelList = await Noco.ncMeta.metaList2(
        project_id,
        base_id,
        MetaTable.MODELS,
        {
          orderBy: {
            order: 'asc'
          }
        }
      );

      for (const model of modelList) {
        await NocoCache.setv2(model.id, project_id, model);
      }
    }

    return modelList.map(m => new Model(m));
  }

  public static async listWithInfo({
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
        MetaTable.MODELS
      );

      // for (const model of modelList) {
      //   await NocoCache.setv2(model.id, project_id, model);
      // }
    }

    return modelList.map(m => new Model(m));
  }

  public static async clear({ id }: { id: string }): Promise<void> {
    await NocoCache.delAll(`*_${id}`);
    await Column.clearList({ fk_model_id: id });
  }

  public static async get({
    tn,
    id
  }: {
    tn?: string;
    id?: string;
  }): Promise<Model> {
    let modelData = null; //id && (await NocoCache.get(id));
    if (!modelData) {
      modelData = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.MODELS,
        id || {
          tn
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

  public static async getWithInfo({
    tn,
    id
  }: {
    tn?: string;
    id?: string;
  }): Promise<Model> {
    let modelData = null; //id && (await NocoCache.get(id));
    if (!modelData) {
      modelData = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.MODELS,
        id || {
          tn
        }
      );
      await NocoCache.setv2(id, modelData?.base_id, modelData);
      // modelData.filters = await Filter.getFilterObject({
      //   viewId: modelData.id
      // });
      // modelData.sorts = await Sort.list({ modelId: modelData.id });
    }
    if (modelData) {
      const m = new Model(modelData);
      const columns = await m.getColumns();
      await m.getViews();
      m.columnsById = columns.reduce((agg, c) => ({ ...agg, [c.id]: c }), {});
      return m;
    }
    return null;
  }

  public static async getBaseModelSQL(args: {
    id?: string;
    tn?: string;
    viewId?: string;
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
      viewId: args.viewId,
      model
    });
  }

  async delete(): Promise<boolean> {
    // todo: delete
    //  sort, filters - done
    //  views
    //    views col
    //    views filter & sort
    //    shared view url
    //  lookup, relations, virtual cols - done
    //  columns - done
    //  table - done

    await Sort.deleteAll(this.id);
    await Filter.deleteAll(this.id);

    for (const col of await this.getColumns()) {
      let colOptionTableName = null;
      switch (col.uidt) {
        case UITypes.Rollup:
          colOptionTableName = MetaTable.COL_ROLLUP;
          break;
        case UITypes.Lookup:
          colOptionTableName = MetaTable.COL_LOOKUP;
          break;
        case UITypes.ForeignKey:
        case UITypes.LinkToAnotherRecord:
          colOptionTableName = MetaTable.COL_RELATIONS;
          break;
        case UITypes.MultiSelect:
        case UITypes.SingleSelect:
          colOptionTableName = MetaTable.COL_SELECT_OPTIONS;
          break;
        case UITypes.Formula:
          colOptionTableName = MetaTable.COL_FORMULA;
          break;
      }
      if (colOptionTableName) {
        await Noco.ncMeta.metaDelete(null, null, colOptionTableName, {
          fk_column_id: col.id
        });
      }
    }

    await Noco.ncMeta.metaDelete(null, null, MetaTable.COLUMNS, {
      fk_model_id: this.id
    });

    await Noco.ncMeta.metaDelete(null, null, MetaTable.MODELS, this.id);

    return true;
  }

  async mapAliasToColumn(data) {
    const insertObj = {};
    for (const col of await this.getColumns()) {
      if (isVirtualCol(col)) continue;
      const val = data?.[col.cn] ?? data?.[col._cn];
      if (val !== undefined) insertObj[col.cn] = val;
    }
    return insertObj;
  }
}
