import Noco from '../../lib/noco/Noco';
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

export default class Column implements NcColumn {
  public _cn: string;
  public ai: boolean;
  public au: boolean;
  public cc: string;
  public clen: number | string;
  public cn: string;
  public cop: number | string;
  public created_at: Date | number | string;
  public csn: string;
  public ct: string;
  public ctf: any;
  public base_id: string;
  public db_alias: 'db' | string;
  public deleted: boolean;
  public dt: string;
  public dtx: string;
  public dtxp: string | number;
  public dtxs: string | number;
  public model_id: string;
  public np: number | string;
  public ns: number | string;
  public order: number;
  public pk: boolean;
  public pv: boolean;
  public project_id: string;
  public rqd: boolean;
  public uidt: UITypes;
  public un: boolean;
  public unique: boolean;
  public updated_at: Date | number | string;
  public fk_model_id: string;

  public colOptions: any;
  public model: Model;

  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public async getModel(): Promise<Model> {
    return Model.get({
      id: this.fk_model_id
    });
  }

  public static async insert<T>(model: Partial<Column & T & any>) {
    const row = await Noco.ncMeta.metaInsert2(
      model.project_id || model.base_id,
      model.db_alias,
      'nc_columns_v2',
      {
        fk_model_id: model.fk_model_id,
        cn: model.cn,
        _cn: model._cn,

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
        au: model.au,
        pv: model.pv
      }
    );

    switch (model.uidt) {
      case UITypes.Lookup:
        // LookupColumn.insert()

        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_lookup_v2',
          {
            fk_column_id: row.id,

            fk_relation_column_id: model.fk_relation_column_id,

            fk_lookup_column_id: model.fk_lookup_column_id
          }
        );
        break;
      case UITypes.Rollup:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_rollup_v2',
          {
            fk_column_id: row.id,
            fk_relation_column_id: model.fk_relation_column_id,

            fk_rollup_column_id: model.fk_rollup_column_id,
            rollup_function: model.rollup_function
          }
        );
        break;
      case UITypes.ForeignKey:
      case UITypes.LinkToAnotherRecord:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_relations_v2',
          {
            fk_column_id: row.id,

            // ref_db_alias
            type: model.type,
            // db_type:

            fk_child_column_id: model.fk_child_column_id,
            fk_parent_column_id: model.fk_parent_column_id,

            fk_mm_model_id: model.fk_mm_model_id,
            fk_mm_child_column_id: model.fk_mm_child_column_id,
            fk_mm_parent_column_id: model.fk_mm_parent_column_id,

            ur: model.ur,
            dr: model.dr,

            fk_index_name: model.fk_index_name
          }
        );
        break;
      case UITypes.Formula:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_formula_v2',
          {
            fk_column_id: row.id,
            formula: row.formula,

            fkn: model.fkn
          }
        );
        break;
      case UITypes.MultiSelect:
      case UITypes.SingleSelect:
        for (const option of model.dtxp?.split(',') || [])
          await Noco.ncMeta.metaInsert2(
            model.project_id,
            model.db_alias,
            'nc_col_select_options_v2',
            {
              fk_column_id: row.id,
              title: option
            }
          );
        break;

      /*  default:
        {
          await Noco.ncMeta.metaInsert2(
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
              await Noco.ncMeta.metaInsert2(
                model.project_id,
                model.db_alias,
                'nc_col_select_options_v2',
                {
                  column_id: row.id,
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
      this.model = await Model.get({
        base_id: this.base_id,
        db_alias: this.db_alias,
        id: this.fk_model_id
      });
    }

    return this.model;
  }

  public static async clearList({ fk_model_id }) {
    const columnList = await NocoCache.getAll(`${fk_model_id}_cl*`);
    if (columnList?.length) {
      for (const { id } of columnList) {
        this.clear({ id });
      }
    }
  }

  public static async clear({ id }) {
    await NocoCache.delAll(`${id}_*`);
    await NocoCache.delAll(`*_${id}`);
  }

  public static async list({
    base_id,
    db_alias,
    fk_model_id
  }: {
    base_id: string;
    db_alias: string;
    fk_model_id: string;
  }): Promise<Column[]> {
    let columnsList = null; // await NocoCache.getv2(fk_model_id);
    if (!columnsList?.length) {
      columnsList = await Noco.ncMeta.metaList2(
        base_id,
        db_alias,
        'nc_columns_v2',
        {
          condition: {
            fk_model_id
          }
        }
      );
      for (const column of columnsList) {
        await NocoCache.setv2(column.id, fk_model_id, column);
      }
    }
    return Promise.all(
      columnsList.map(async m => {
        const column = new Column(m);
        await column.getColOptions();
        return column;
      })
    );

    /*const columns = Noco.ncMeta
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
        Noco.ncMeta
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

  public static async get({
    base_id,
    db_alias,
    colId
  }: {
    base_id?: string;
    db_alias?: string;
    colId: string;
  }): Promise<Column> {
    let colData = null; // await NocoCache.get(colId);
    if (!colData) {
      colData = await Noco.ncMeta.metaGet2(
        base_id,
        db_alias,
        'nc_columns_v2',
        colId
      );
      await NocoCache.set(colId, colData);
    }
    if (colData) {
      const column = new Column(colData);
      await column.getColOptions();
      return column;
    }
    return null;
  }

  id: string;
}
