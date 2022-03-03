import Noco from '../../lib/noco/Noco';
import Column from './Column';
import NcModel from '../../types/NcModel';
import NocoCache from '../noco-cache/NocoCache';
import { XKnex } from '../dataMapper';
import { BaseModelSqlv2 } from '../dataMapper/lib/sql/BaseModelSqlv2';
import {
  isVirtualCol,
  ModelTypes,
  TableReqType,
  TableType,
  ViewTypes
} from 'nc-common';
import UITypes from '../sqlUi/UITypes';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import View from './View';
import { NcError } from '../noco/meta/api/helpers/catchError';

export default class Model implements TableType {
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
  type: ModelTypes;
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

  public async getColumns(
    // @ts-ignore
    force = false,
    ncMeta = Noco.ncMeta
  ): Promise<Column[]> {
    this.columns = await Column.list(
      {
        fk_model_id: this.id
      },
      ncMeta
    );
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
    model: TableReqType,
    ncMeta = Noco.ncMeta
  ) {
    const { id } = await ncMeta.metaInsert2(
      projectId,
      baseId,
      MetaTable.MODELS,
      {
        tn: model.tn,
        _tn: model._tn,
        order:
          model.order ||
          (await ncMeta.metaGetNextOrder(MetaTable.FORM_VIEW_COLUMNS, {
            project_id: projectId,
            base_id: baseId
          })),
        type: model.type || ModelTypes.TABLE
      }
    );

    await NocoCache.appendToList(
      CacheScope.MODEL,
      [projectId, baseId],
      `${CacheScope.MODEL}:${id}`
    );

    const view = await View.insert(
      {
        fk_model_id: id,
        title: model._tn || model.tn,
        is_default: true,
        type: ViewTypes.GRID
      },
      ncMeta
    );

    for (const column of model?.columns || []) {
      await Column.insert({ ...column, fk_model_id: id, view }, ncMeta);
    }

    return this.getWithInfo({ id });
  }

  public static async list(
    {
      project_id,
      base_id
    }: {
      project_id: string;
      base_id: string;
    },
    ncMeta = Noco.ncMeta
  ): Promise<Model[]> {
    let modelList = await NocoCache.getList(CacheScope.MODEL, [
      project_id,
      base_id
    ]);
    if (!modelList.length) {
      modelList = await ncMeta.metaList2(
        project_id,
        base_id,
        MetaTable.MODELS,
        {
          orderBy: {
            order: 'asc'
          }
        }
      );

      await NocoCache.setList(
        CacheScope.MODEL,
        [project_id, base_id],
        modelList
      );
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
    let modelList = await NocoCache.getList(CacheScope.MODEL, [
      project_id,
      db_alias
    ]);
    if (!modelList.length) {
      modelList = await Noco.ncMeta.metaList2(
        project_id,
        db_alias,
        MetaTable.MODELS
      );

      await NocoCache.setList(
        CacheScope.MODEL,
        [project_id, db_alias],
        modelList
      );
    }

    return modelList.map(m => new Model(m));
  }

  public static async clear({ id }: { id: string }): Promise<void> {
    await NocoCache.delAll(CacheScope.MODEL, `*${id}*`);
    await Column.clearList({ fk_model_id: id });
  }

  public static async get(id: string, ncMeta = Noco.ncMeta): Promise<Model> {
    let modelData =
      id &&
      (await NocoCache.get(
        `${CacheScope.MODEL}:${id}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!modelData) {
      modelData = await ncMeta.metaGet2(null, null, MetaTable.MODELS, id);
      await NocoCache.set(`${CacheScope.MODEL}:${modelData.id}`, modelData);
    }
    return modelData && new Model(modelData);
  }

  public static async getByIdOrName(
    args:
      | {
          tn?: string;
        }
      | {
          id?: string;
        },
    ncMeta = Noco.ncMeta
  ): Promise<Model> {
    const k = 'id' in args ? args?.id : args;
    let modelData =
      k &&
      (await NocoCache.get(
        `${CacheScope.MODEL}:${k}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!modelData) {
      modelData = await ncMeta.metaGet2(null, null, MetaTable.MODELS, k);
      await NocoCache.set(`${CacheScope.MODEL}:${modelData.id}`, modelData);
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
    let modelData =
      id &&
      (await NocoCache.get(
        `${CacheScope.MODEL}:${id}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!modelData) {
      modelData = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.MODELS,
        id || {
          tn
        }
      );
      await NocoCache.set(`${CacheScope.MODEL}:${modelData.id}`, modelData);
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
      (await this.getByIdOrName({
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

  async delete(ncMeta = Noco.ncMeta): Promise<boolean> {
    // todo: table delete
    // todo: delete
    //  sort, filters - done
    //  views
    //    views col
    //    views filter & sort
    //    shared view url
    //  lookup, relations, virtual cols - done
    //  columns - done
    //  table - done

    for (const view of await this.getViews(true)) {
      await view.delete();
    }

    for (const col of await this.getColumns(false, ncMeta)) {
      let colOptionTableName = null;
      let cacheScopeName = null;
      switch (col.uidt) {
        case UITypes.Rollup:
          colOptionTableName = MetaTable.COL_ROLLUP;
          cacheScopeName = CacheScope.COL_ROLLUP;
          break;
        case UITypes.Lookup:
          colOptionTableName = MetaTable.COL_LOOKUP;
          cacheScopeName = CacheScope.COL_LOOKUP;
          break;
        case UITypes.ForeignKey:
        case UITypes.LinkToAnotherRecord:
          colOptionTableName = MetaTable.COL_RELATIONS;
          cacheScopeName = CacheScope.COL_RELATION;
          break;
        case UITypes.MultiSelect:
        case UITypes.SingleSelect:
          colOptionTableName = MetaTable.COL_SELECT_OPTIONS;
          cacheScopeName = CacheScope.COL_SELECT_OPTION;
          break;
        case UITypes.Formula:
          colOptionTableName = MetaTable.COL_FORMULA;
          cacheScopeName = CacheScope.COL_FORMULA;
          break;
      }
      if (colOptionTableName && cacheScopeName) {
        await ncMeta.metaDelete(null, null, colOptionTableName, {
          fk_column_id: col.id
        });
        await NocoCache.deepDel(
          cacheScopeName,
          `${cacheScopeName}:${col.id}`,
          CacheDelDirection.CHILD_TO_PARENT
        );
      }
    }

    await NocoCache.deepDel(
      CacheScope.COLUMN,
      `${CacheScope.COLUMN}:${this.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.COLUMNS, {
      fk_model_id: this.id
    });

    await NocoCache.deepDel(
      CacheScope.MODEL,
      `${CacheScope.MODEL}:${this.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.MODELS, this.id);

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

  static async updateAlias(tableId, _tn: string, ncMeta = Noco.ncMeta) {
    if (!_tn) NcError.badRequest("Missing '_tn' property in body");
    // get existing cache
    const key = `${CacheScope.MODEL}:${tableId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    // update alias
    o._tn = _tn;
    // set cache
    await NocoCache.set(key, o);
    // set meta
    return await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.MODELS,
      {
        _tn
      },
      tableId
    );
  }

  return;

  async getAliasColMapping() {
    return (await this.getColumns()).reduce((o, c) => {
      if (c.cn) {
        o[c._cn] = c.cn;
      }
      return o;
    }, {});
  }

  async getColAliasMapping() {
    return (await this.getColumns()).reduce((o, c) => {
      if (c.cn) {
        o[c.cn] = c._cn;
      }
      return o;
    }, {});
  }

  static async updateOrder(
    tableId: string,
    order: number,
    ncMeta = Noco.ncMeta
  ) {
    // todo : redis del - table list
    return await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.MODELS,
      {
        order
      },
      tableId
    );
  }

  static async updatePrimaryColumn(
    tableId: string,
    columnId: string,
    ncMeta = Noco.ncMeta
  ) {
    // todo : redis del - table get
    const model = await this.getWithInfo({ id: tableId });

    const currentPvCol = model.primaryValue;
    const newPvCol = model.columns.find(c => c.id === columnId);

    if (!newPvCol) NcError.badRequest('Column not found');

    if (currentPvCol)
      await ncMeta.metaUpdate(
        null,
        null,
        MetaTable.COLUMNS,
        {
          pv: false
        },
        currentPvCol.id
      );

    await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.COLUMNS,
      {
        pv: true
      },
      newPvCol.id
    );

    return true;
  }
}
