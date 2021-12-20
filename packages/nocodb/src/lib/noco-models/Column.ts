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

  public static async insert(model: NcColumn | any) {
    await Noco.ncMeta.metaInsert2(
      model.project_id,
      model.db_alias,
      'nc_columns_v2',
      model
    );

    const row = await Noco.ncMeta.metaGet2(
      model.project_id,
      model.db_alias,
      'nc_columns_v2',
      model
    );

    switch (model.uidt) {
      case UITypes.Lookup:
        await Noco.ncMeta.metaGet2(
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
        await Noco.ncMeta.metaGet2(
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
      case UITypes.LinkToAnotherRecord:
        await Noco.ncMeta.metaGet2(
          model.project_id,
          model.db_alias,
          'nc_col_relations_v2',
          {
            column_id: row.id,

            // ref_db_alias
            type: model.type || 'real',
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
        await Noco.ncMeta.metaGet2(
          model.project_id,
          model.db_alias,
          'nc_col_relations_v2',
          {
            column_id: row.id,
            formula: row.formula,

            fkn: model.fkn
          }
        );
        break;

      default:
        {
          await Noco.ncMeta.metaGet2(
            model.project_id,
            model.db_alias,
            'nc_col_relations_v2',
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
        }
        break;

      /*


        await knex.schema.createTable('nc_col_rollup_v2', table => {
          table
            .uuid('id')
            .primary()
            .notNullable();

          table.string('base_id', 128);
          table.foreign('base_id').references('nc_bases.id');
          table.string('db_alias').defaultTo('db');

          table.uuid('column_id');
          table.foreign('column_id').references('nc_columns_v2.id');

          table.uuid('rel_column_id');
          table.foreign('rel_column_id').references('nc_columns_v2.id');
          table.uuid('ref_rel_column_id');
          table.foreign('ref_rel_column_id').references('nc_columns_v2.id');

          table.uuid('rollup_column_id');
          table.foreign('rollup_column_id').references('nc_columns_v2.id');
          table.string('rollup_function');
          table.boolean('deleted');
          table.integer('order');
          table.timestamps(true, true);
        });
              await knex.schema.createTable('nc_col_relations_v2', table => {
                table
                  .uuid('id')
                  .primary()
                  .notNullable();

                table.string('base_id', 128);
                table.foreign('base_id').references('nc_bases.id');
                table.string('db_alias').defaultTo('db');

                // table.string('base_id');
                // table.string('db_alias');
                // table.string('tn');
                // table.string('rtn');
                // table.string('_tn');
                // table.string('_rtn');
                // table.string('cn');
                // table.string('rcn');
                // table.string('_cn');
                // table.string('_rcn');

                table.string('ref_db_alias');
                table.string('type');
                table.string('db_type');

                table.uuid('column_id');
                table.foreign('column_id').references('nc_columns_v2.id');

                table.uuid('rel_column_id');
                table.foreign('rel_column_id').references('nc_columns_v2.id');
                table.uuid('ref_rel_column_id');
                table.foreign('ref_rel_column_id').references('nc_columns_v2.id');

                table.uuid('v_rel_tn');
                table.foreign('v_rel_tn').references('nc_models.id');
                table.uuid('v_ref_rel_cn_id');
                table.foreign('v_ref_rel_cn_id').references('nc_columns_v2.id');
                table.uuid('v_rel_cn_id');
                table.foreign('v_rel_cn_id').references('nc_columns_v2.id');

                table.string('ur');
                table.string('dr');

                table.string('fkn');

                table.boolean('deleted');
                table.integer('order');
                table.timestamps(true, true);
                // table.index(['db_alias', 'tn']);
              });

              await knex.schema.createTable('nc_col_lookup_v2', table => {
                table
                  .uuid('id')
                  .primary()
                  .notNullable();

                table.string('base_id', 128);
                table.foreign('base_id').references('nc_bases.id');
                table.string('db_alias').defaultTo('db');

                table.uuid('column_id');
                table.foreign('column_id').references('nc_columns_v2.id');

                table.uuid('rel_column_id');
                table.foreign('rel_column_id').references('nc_columns_v2.id');
                table.uuid('ref_rel_column_id');
                table.foreign('ref_rel_column_id').references('nc_columns_v2.id');

                table.uuid('lookup_column_id');
                table.foreign('lookup_column_id').references('nc_columns_v2.id');
                table.boolean('deleted');
                table.integer('order');
                table.timestamps(true, true);
              });
              await knex.schema.createTable('nc_col_formula_v2', table => {
                table
                  .uuid('id')
                  .primary()
                  .notNullable();

                table.string('base_id', 128);
                table.foreign('base_id').references('nc_bases.id');
                table.string('db_alias').defaultTo('db');

                table.uuid('column_id');
                table.foreign('column_id').references('nc_columns_v2.id');

                table.text('formula').notNullable();

                table.boolean('deleted');
                table.integer('order');
                table.timestamps(true, true);
              });*/
    }
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
    // return (
    //   await Noco.ncMeta.metaList2(project_id, db_alias, 'nc_columns_v2', {
    //     condition
    //   })
    // ).map(m => new Column(m));

    const columns = Noco.ncMeta
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
      .condition(condition);

    return columns.map(c => new Column(c));
  }

  id: string;
}
