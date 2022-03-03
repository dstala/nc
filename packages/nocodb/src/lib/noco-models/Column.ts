import NcColumn from '../../types/NcColumn';
import UITypes from '../sqlUi/UITypes';
import FormulaColumn from './FormulaColumn';
import LinkToAnotherRecordColumn from './LinkToAnotherRecordColumn';
import LookupColumn from './LookupColumn';
import RollupColumn from './RollupColumn';
import SingleSelectColumn from './SingleSelectColumn';
import MultiSelectColumn from './MultiSelectColumn';
import Model from './Model';
import NocoCache from '../noco-cache/NocoCache';
import { ColumnType } from 'nc-common';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import View from './View';
import Noco from '../noco/Noco';

export default class Column implements ColumnType {
  public fk_model_id: string;
  public project_id: string;
  public base_id: string;

  public cn: string;
  public _cn: string;

  public uidt: UITypes;
  public dt: string;
  public np: string;
  public ns: string;
  public clen: string;
  public cop: string;
  public pk: boolean;
  public pv: boolean;
  public rqd: boolean;
  public un: boolean;
  public ct: string;
  public ai: boolean;
  public unique: boolean;
  public cdf: string;
  public cc: string;
  public csn: string;
  public dtx: string;
  public dtxp: string;
  public dtxs: string;
  public au: boolean;

  public colOptions: any;
  public model: Model;

  public order: number;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public async getModel(): Promise<Model> {
    return Model.getByIdOrName({
      id: this.fk_model_id
    });
  }

  public static async insert<T>(
    column: Partial<T> & { base_id?: string; [key: string]: any },
    ncMeta = Noco.ncMeta
  ) {
    const insertObj = {
      fk_model_id: column.fk_model_id,
      cn: column.cn,
      _cn: column._cn || column.cn,
      uidt: column.uidt,
      dt: column.dt,
      np: column.np,
      ns: column.ns,
      clen: column.clen,
      cop: column.cop,
      pk: column.pk,
      rqd: column.rqd,
      un: column.un,
      ct: column.ct,
      ai: column.ai,
      unique: column.unique,
      cdf: column.cdf,
      cc: column.cc,
      csn: column.csn,
      dtx: column.dtx,
      dtxp: column.dtxp,
      dtxs: column.dtxs,
      au: column.au,
      pv: column.pv,
      order: column.order,
      project_id: column.project_id,
      base_id: column.base_id
    };
    if (!(column.project_id && column.base_id)) {
      const model = await Model.getByIdOrName({ id: column.fk_model_id });
      insertObj.project_id = model.project_id;
      insertObj.base_id = model.base_id;
    }

    if (!column.uidt) throw new Error('UI Datatype not found');
    const order = 1;
    const row = await ncMeta.metaInsert2(
      null, //column.project_id || column.base_id,
      null, //column.db_alias,
      MetaTable.COLUMNS,
      insertObj
    );

    await this.insertColOption(column, row.id, ncMeta);

    await View.insertColumnToAllViews(
      {
        fk_column_id: row.id,
        fk_model_id: column.fk_model_id,
        order,
        show: true
      },
      ncMeta
    );

    return row;
  }

  private static async insertColOption<T>(
    column: Partial<T> & { base_id?: string; [p: string]: any },
    colId,
    ncMeta = Noco.ncMeta
  ) {
    switch (column.uidt || column.ui_data_type) {
      case UITypes.Lookup: {
        // LookupColumn.insert()

        const row = await LookupColumn.insert(
          {
            fk_column_id: colId,
            fk_relation_column_id: column.fk_relation_column_id,
            fk_lookup_column_id: column.fk_lookup_column_id
          },
          ncMeta
        );
        await NocoCache.set(`${CacheScope.COL_LOOKUP}:${row.id}`, row);
        break;
      }
      case UITypes.Rollup: {
        const row = await RollupColumn.insert(
          {
            fk_column_id: colId,
            fk_relation_column_id: column.fk_relation_column_id,

            fk_rollup_column_id: column.fk_rollup_column_id,
            rollup_function: column.rollup_function
          },
          ncMeta
        );
        await NocoCache.set(`${CacheScope.COL_ROLLUP}:${row.id}`, row);
        break;
      }
      case UITypes.LinkToAnotherRecord: {
        const row = await LinkToAnotherRecordColumn.insert(
          {
            fk_column_id: colId,

            // ref_db_alias
            type: column.type,
            // db_type:

            fk_child_column_id: column.fk_child_column_id,
            fk_parent_column_id: column.fk_parent_column_id,

            fk_mm_model_id: column.fk_mm_model_id,
            fk_mm_child_column_id: column.fk_mm_child_column_id,
            fk_mm_parent_column_id: column.fk_mm_parent_column_id,

            ur: column.ur,
            dr: column.dr,

            fk_index_name: column.fk_index_name,
            fk_related_model_id: column.fk_related_model_id
          },
          ncMeta
        );
        await NocoCache.set(`${CacheScope.COL_RELATION}:${row.id}`, row);
        break;
      }
      case UITypes.Formula: {
        const row = await FormulaColumn.insert(
          {
            fk_column_id: colId,
            formula: column.formula,
            formula_raw: column.formula_raw
          },
          ncMeta
        );
        await NocoCache.set(`${CacheScope.COL_FORMULA}:${row.id}`, row);
        break;
      }
      case UITypes.MultiSelect: {
        for (const option of column.dtxp?.split(',') || []) {
          const row = await MultiSelectColumn.insert(
            {
              fk_column_id: colId,
              title: option
            },
            ncMeta
          );
          await NocoCache.set(`${CacheScope.COL_SELECT_OPTION}:${row.id}`, row);
        }
        break;
      }
      case UITypes.SingleSelect: {
        for (const option of column.dtxp?.split(',') || []) {
          const row = await SingleSelectColumn.insert(
            {
              fk_column_id: colId,
              title: option
            },
            ncMeta
          );
          await NocoCache.set(`${CacheScope.COL_SELECT_OPTION}:${row.id}`, row);
        }
        break;
      }

      /*  default:
        {
          await ncMeta.metaInsert2(
            model.project_id,
            model.db_alias,
            'nc_col_props_v2',
            {
              column_id: model.column_id,

              cn: model.cn,
              // todo: decide type
              uidt: model.uidt,
              dt: model.dt,
              np: model.np,
              ns: model.ns,
              clen: model.clen,
              cop: model.cop,
              pk: model.pk,
              rqd: model.rqd,
              un: model.un,
              ct: model.ct,
              ai: model.ai,
              unique: model.unique,
              ctf: model.ctf,
              cc: model.cc,
              csn: model.csn,
              dtx: model.dtx,
              dtxp: model.dtxp,
              dtxs: model.dtxs,
              au: model.au
            }
          );
          if (
            model.uidt === UITypes.MultiSelect ||
            model.uidt === UITypes.SingleSelect
          ) {
            for (const option of model.dtxp.split(','))
              await ncMeta.metaInsert2(
                model.project_id,
                model.db_alias,
                MetaTable.COL_SELECT_OPTIONS',
                {
                  column_id: colId,
                  name: option
                }
              );
          }
        }
        break;*/
    }
  }

  public async getColOptions<T>(): Promise<T> {
    let res: any;

    switch (this.uidt) {
      case UITypes.Lookup:
        res = await LookupColumn.read(this.id);
        break;
      case UITypes.Rollup:
        res = await RollupColumn.read(this.id);
        break;
      case UITypes.LinkToAnotherRecord:
        res = await LinkToAnotherRecordColumn.read(this.id);
        break;
      case UITypes.ForeignKey:
        res = await LinkToAnotherRecordColumn.read(this.id);
        break;
      case UITypes.MultiSelect:
        res = await MultiSelectColumn.read(this.id);
        break;
      case UITypes.SingleSelect:
        res = await SingleSelectColumn.read(this.id);
        break;
      case UITypes.Formula:
        res = await FormulaColumn.read(this.id);
        break;
      // default:
      //   res = await DbColumn.read(this.id);
      //   break;
    }
    this.colOptions = res;
    return res;
  }

  async loadModel(force = false): Promise<Model> {
    if (!this.model || force) {
      this.model = await Model.getByIdOrName({
        // base_id: this.project_id,
        // db_alias: this.db_alias,
        id: this.fk_model_id
      });
    }

    return this.model;
  }

  public static async clearList({ fk_model_id }) {
    await NocoCache.deepDel(
      CacheScope.COLUMN,
      `${CacheScope.COLUMN}:${fk_model_id}:list`,
      CacheDelDirection.PARENT_TO_CHILD
    );
  }

  public static async clear({ id }) {
    await NocoCache.delAll(CacheScope.COLUMN, `*${id}*`);
  }

  public static async list(
    {
      fk_model_id
    }: {
      fk_model_id: string;
    },
    ncMeta = Noco.ncMeta
  ): Promise<Column[]> {
    let columnsList = await NocoCache.getList(CacheScope.COLUMN, [fk_model_id]);
    if (!columnsList.length) {
      columnsList = await ncMeta.metaList2(null, null, MetaTable.COLUMNS, {
        condition: {
          fk_model_id
        },
        orderBy: {
          order: 'asc'
        }
      });
      await NocoCache.setList(CacheScope.COLUMN, [fk_model_id], columnsList);
    }
    return Promise.all(
      columnsList.map(async m => {
        const column = new Column(m);
        await column.getColOptions();
        return column;
      })
    );

    /*const columns = ncMeta
      .knex('nc_models_v2 as tab')
      .select(
        'col.id',
        'col.cn',
        'col._cn',
        'col.uidt',
        'rel.rel_cn',
        'rel.ref_rel_cn',
        'rel.id as rel_id'
      )
      .join('nc_columns_v2 as col', 'tab.id', 'col.model_id')
      .leftJoin(
        ncMeta
          .knex('nc_col_relations_v2 as r')
          .select(
            'r.*',
            'col1.cn as rel_cn',
            'col1._cn as _rel_cn',
            'col2.cn as ref_rel_cn',
            'col2._cn as _ref_rel_cn'
          )
          .join('nc_columns_v2 as col1', 'col1.id', 'r.rel_column_id')
          .join('nc_columns_v2 as col2', 'col2.id', 'r.ref_rel_column_id')
          .as('rel'),
        'col.id',
        'rel.column_id'
      )
      .condition(condition)
      .where({
        'tab.base_id': base_id,
        'tab.db_alias': db_alias
      });

    return columns.map(c => new Column(c));*/
  }

  public static async get(
    {
      base_id,
      db_alias,
      colId
    }: {
      base_id?: string;
      db_alias?: string;
      colId: string;
    },
    ncMeta = Noco.ncMeta
  ): Promise<Column> {
    let colData =
      colId &&
      (await NocoCache.get(
        `${CacheScope.COLUMN}:${colId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!colData) {
      colData = await ncMeta.metaGet2(
        base_id,
        db_alias,
        MetaTable.COLUMNS,
        colId
      );
      await NocoCache.set(`${CacheScope.COLUMN}:${colId}`, colData);
    }
    if (colData) {
      const column = new Column(colData);
      await column.getColOptions();
      return column;
    }
    return null;
  }

  id: string;

  static async delete(id, ncMeta = Noco.ncMeta) {
    const col = await this.get({ colId: id }, ncMeta);

    // todo: redis del - sort, filter, grid column, columns
    // todo: delete from view column list
    // todo: delete from sort list
    // todo: delete from filter list

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
    await ncMeta.metaDelete(null, null, MetaTable.GRID_VIEW_COLUMNS, {
      fk_column_id: col.id
    });
    // TODO: Cache - add fields when implementation is done
    await NocoCache.deepDel(
      CacheScope.GRID_VIEW_COLUMN,
      `${CacheScope.GRID_VIEW_COLUMN}:${col.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.FORM_VIEW_COLUMNS, {
      fk_column_id: col.id
    });
    // TODO: Cache - add fields when implementation is done
    await NocoCache.deepDel(
      CacheScope.FORM_VIEW_COLUMN,
      `${CacheScope.FORM_VIEW_COLUMN}:${col.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.KANBAN_VIEW_COLUMNS, {
      fk_column_id: col.id
    });
    // TODO: Cache - add fields when implementation is done
    await NocoCache.deepDel(
      CacheScope.KANBAN_VIEW_COLUMN,
      `${CacheScope.KANBAN_VIEW_COLUMN}:${col.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.GALLERY_VIEW_COLUMNS, {
      fk_column_id: col.id
    });
    // TODO: Cache - add fields when implementation is done
    await NocoCache.deepDel(
      CacheScope.GALLERY_VIEW_COLUMN,
      `${CacheScope.GALLERY_VIEW_COLUMN}:${col.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    await ncMeta.metaDelete(null, null, MetaTable.COLUMNS, col.id);
    // TODO: Cache - add fields when implementation is done
    await NocoCache.deepDel(
      CacheScope.COLUMN,
      `${CacheScope.COLUMN}:${col.id}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
  }

  static async update(colId: string, column: any, ncMeta = Noco.ncMeta) {
    const oldCol = await Column.get({ colId }, ncMeta);

    switch (oldCol.uidt) {
      case UITypes.Lookup: {
        // LookupColumn.insert()

        const row = await ncMeta.metaDelete(null, null, MetaTable.COL_LOOKUP, {
          fk_column_id: colId
        });
        // TODO: Cache - add fields when implementation is done
        await NocoCache.set(`${CacheScope.COL_LOOKUP}:${colId}`, row);
        break;
      }
      case UITypes.Rollup: {
        const row = await ncMeta.metaDelete(null, null, MetaTable.COL_ROLLUP, {
          fk_column_id: colId
        });
        // TODO: Cache - add fields when implementation is done
        await NocoCache.set(`${CacheScope.COL_ROLLUP}:${colId}`, row);
        break;
      }

      case UITypes.ForeignKey:
      case UITypes.LinkToAnotherRecord: {
        const row = await ncMeta.metaDelete(
          null,
          null,
          MetaTable.COL_RELATIONS,
          {
            fk_column_id: colId
          }
        );
        await NocoCache.set(`${CacheScope.COL_RELATION}:${colId}`, row);
        break;
      }
      case UITypes.Formula: {
        const row = await ncMeta.metaDelete(null, null, MetaTable.COL_FORMULA, {
          fk_column_id: colId
        });
        await NocoCache.set(`${CacheScope.COL_FORMULA}:${colId}`, row);
        break;
      }

      case UITypes.MultiSelect:
      case UITypes.SingleSelect: {
        const row = await ncMeta.metaDelete(
          null,
          null,
          MetaTable.COL_SELECT_OPTIONS,
          {
            fk_column_id: colId
          }
        );
        await NocoCache.set(`${CacheScope.COL_SELECT_OPTION}:${colId}`, row);
        break;
      }
    }
    const updateObj = {
      cn: column.cn,
      _cn: column._cn,
      uidt: column.uidt,
      dt: column.dt,
      np: column.np,
      ns: column.ns,
      clen: column.clen,
      cop: column.cop,
      pk: column.pk,
      rqd: column.rqd,
      un: column.un,
      ct: column.ct,
      ai: column.ai,
      unique: column.unique,
      cdf: column.cdf,
      cc: column.cc,
      csn: column.csn,
      dtx: column.dtx,
      dtxp: column.dtxp,
      dtxs: column.dtxs,
      au: column.au,
      pv: column.pv
    };
    // get existing cache
    const key = `${CacheScope.COLUMN}:${colId}`;
    let o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    o = { ...o, ...updateObj };
    // set cache
    await NocoCache.set(key, o);
    // set meta
    await ncMeta.metaUpdate(null, null, MetaTable.COLUMNS, updateObj, colId);
    await this.insertColOption(column, colId, ncMeta);
  }

  static async updateAlias(
    colId: string,
    { _cn }: { _cn: string },
    ncMeta = Noco.ncMeta
  ) {
    // get existing cache
    const key = `${CacheScope.COLUMN}:${colId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    // update alias
    o._cn = _cn;
    // set cache
    await NocoCache.set(key, o);
    // set meta
    await ncMeta.metaUpdate(
      null, //column.project_id || column.base_id,
      null, //column.db_alias,
      MetaTable.COLUMNS,
      {
        _cn
      },
      colId
    );
  }
}
