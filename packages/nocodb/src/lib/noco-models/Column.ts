import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import UITypes from '../sqlUi/UITypes';
import DbColumn from './DbColumn';
import FormulaColumn from './FormulaColumn';
import LinkToAnotherRecordColumn from './LinkToAnotherRecordColumn';
import LookupColumn from './LookupColumn';
import RollupColumn from './RollupColumn';
import SingleSelectColumn from './SingleSelectColumn';
import MultiSelectColumn from './MultiSelectColumn';

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

  public static async insert(model: NcColumn | any) {
    const row = await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_columns_v2',
      {
        tn: model.tn,
        _tn: model._tn
      }
    );

    switch (model.uidt) {
      case UITypes.Lookup:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_lookup_v2',
          {
            column_id: row.id,

            rel_column_id: model.rel_column_id,
            ref_rel_column_id: model.ref_rel_column_id,

            lookup_column_id: model.lookup_column_id
          }
        );
        break;
      case UITypes.Rollup:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_rollup_v2',
          {
            column_id: row.id,

            rel_column_id: model.rel_column_id,
            ref_rel_column_id: model.ref_rel_column_id,

            rollup_column_id: model.rollup_column_id,
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
            column_id: row.id,

            // ref_db_alias
            type: model.type,
            // db_type:

            rel_column_id: model.rel_column_id,
            ref_rel_column_id: model.ref_rel_column_id,

            v_rel_tn: model.v_rel_tn,
            v_ref_rel_cn_id: model.v_ref_rel_cn_id,
            v_rel_cn_id: model.v_rel_cn_id,

            ur: model.ur,
            dr: model.dr,

            fkn: model.fkn
          }
        );
        break;
      case UITypes.Formula:
        await Noco.ncMeta.metaInsert2(
          model.project_id,
          model.db_alias,
          'nc_col_formula_v2',
          {
            column_id: row.id,
            formula: row.formula,

            fkn: model.fkn
          }
        );
        break;

      default:
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
                  name: option,

                  fkn: model.fkn
                }
              );
          }
        }
        break;
    }
  }

  public async colOptions(): Promise<
    | DbColumn
    | FormulaColumn
    | LinkToAnotherRecordColumn
    | LookupColumn
    | RollupColumn
    | SingleSelectColumn
    | MultiSelectColumn
  > {
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
      case UITypes.MultiSelect:
        res = await MultiSelectColumn.read(this.id);
        break;
      case UITypes.SingleSelect:
        res = await SingleSelectColumn.read(this.id);
        break;
      case UITypes.Formula:
        res = await FormulaColumn.read(this.id);
        break;
      default:
        res = await DbColumn.read(this.id);
        break;
    }

    return res;
  }

  public static async list({
    base_id,
    db_alias,
    condition
  }: {
    base_id: string;
    db_alias: string;
    condition: any;
  }): Promise<Column[]> {
    return (
      await Noco.ncMeta.metaList2(base_id, db_alias, 'nc_columns_v2', {
        condition
      })
    ).map(m => new Column(m));

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

  id: string;
}
