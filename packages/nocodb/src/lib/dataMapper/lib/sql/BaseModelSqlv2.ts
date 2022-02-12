import autoBind from 'auto-bind';
import _ from 'lodash';

import Model from '../../../noco-models/Model';
import { XKnex } from '../..';
import LinkToAnotherRecordColumn from '../../../noco-models/LinkToAnotherRecordColumn';
import UITypes from '../../../sqlUi/UITypes';
import RollupColumn from '../../../noco-models/RollupColumn';
import LookupColumn from '../../../noco-models/LookupColumn';
import DataLoader from 'dataloader';
import Column from '../../../noco-models/Column';
import { XcFilter, XcFilterWithAlias } from '../BaseModel';
import conditionV2 from './conditionV2';
import Filter from '../../../noco-models/Filter';
import sortV2 from './sortV2';
import Sort from '../../../noco-models/Sort';
import FormulaColumn from '../../../noco-models/FormulaColumn';
import genRollupSelectv2 from './genRollupSelectv2';
import formulaQueryBuilderv2 from './formulav2/formulaQueryBuilderv2';
import { QueryBuilder } from 'knex';

/**
 * Base class for models
 *
 * @class
 * @classdesc Base class for models
 */
class BaseModelSqlv2 {
  protected dbDriver: XKnex;
  protected model: Model;
  protected viewId: string;
  private _proto: any;
  private _columns = {};

  private config: any = {
    limitDefault: 25,
    limitMin: 1,
    limitMax: 1000
  };

  constructor({
    dbDriver,
    model,
    viewId
  }: {
    [key: string]: any;
    model: Model;
  }) {
    this.dbDriver = dbDriver;
    this.model = model;
    this.viewId = viewId;
    autoBind(this);
  }

  public async readByPk(id?: any): Promise<any> {
    const qb = this.dbDriver(this.model.tn);

    await this.selectObject({ qb });

    const data = await qb.where(this.model.primaryKey.cn, id).first();

    if (data) {
      const proto = await this.getProto();
      data.__proto__ = proto;
    }
    return data;
  }

  public async list(
    args: { where?: string; limit?; offset? } = {},
    ignoreFilterSort = false
  ): Promise<any> {
    const { where, ...rest } = this._getListArgs(args);

    const qb = this.dbDriver(this.model.tn);

    await this.selectObject({ qb });
    qb.xwhere(where);

    /*    await qb.conditionv2(
          await Filter.getFilterObject({ modelId: this.model.id })
        );*/

    // todo: replace with view id
    if (!ignoreFilterSort) {
      await conditionV2(
        await Filter.rootFilterList({ viewId: this.viewId }),
        qb,
        this.dbDriver
      );

      await sortV2(await Sort.list({ viewId: this.viewId }), qb, this.dbDriver);
      this._paginateAndSort(qb, rest);
    }

    const proto = await this.getProto();

    console.log(qb.toQuery());

    return (await qb).map(d => {
      d.__proto__ = proto;
      return d;
    });

    /* const pk = columnsObj.actor.find(c => c.pk);
    const ids = data.map(r => r[pk.alias]);

    for (const col of columnsObj.actor) {
      switch (col.uidt) {
        case 'LinkToAnotherRecord':
          if (col.type === 'hm') {
            const children = await knex.union(
              ids.map(id => {
                const query = knex(col.rel_tn)
                  .where(col.rel_cn, id)
                  .limit(10);
                return query;
              }),
              true
            );

            const gb = children.reduce((gb, r) => {
              gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || [];
              gb[r[col.rel_cn]].push(r);
              return gb;
            }, {});

            for (const d of data) {
              d[col.alias] = gb[d[pk.alias]];
            }
          }
          if (col.type === 'bt') {
            const parentIds = data
              .map(r => r[col._rel_cn])
              .filter(id => id !== null && id !== undefined);

            const parents = await knex(col.rel_tn).whereIn(
              col.rel_cn,
              parentIds
            );
            // .limit(10)

            const gb = parents.reduce((gb, r) => {
              gb[r[col.ref_rel_cn]] = r;
              return gb;
            }, {});

            for (const d of data) {
              d[col.alias] = gb[d[col._rel_cn]];
            }
          }

          if (col.type === 'mm') {
            const key = `${col.title}_${col.v_rel_cn}`;

            const childs = await knex.union(
              ids.map(id => {
                const query = knex(col.ref_rel_tn)
                  .join(
                    col.v_rel_tn,
                    `${col.v_rel_tn}.${col.v_ref_rel_cn}`,
                    `${col.ref_rel_tn}.${col.ref_rel_cn}`
                  )
                  .where(`${col.v_rel_tn}.${col.v_rel_cn}`, id) // p[this.columnToAlias?.[this.pks[0].title] || this.pks[0].cn])
                  // .xwhere(where, this.dbModels[child].selectQuery(''))
                  .select({
                    [key]: `${col.v_rel_tn}.${col.v_rel_cn}`
                  })
                  .select(`${col.ref_rel_tn}.*`);

                // return this.isSqlite() ? driver.select().from(query) :
                return query;
              }),
              true
            );

            const gs = _.groupBy(childs, key);

            for (const d of data) {
              d[col.alias] = gs[d[pk.alias]];
            }
          }
          break;

        // todo: combine with LinkToAnotherRecord
        case 'Lookup':
          {
            let lkPk,
              prev,
              isArr = col.type !== 'bt';
            let field, lkQb;
            prev = col;
            if (col.type === 'hm') {
              // todo: decide based on type
              field = columnsObj[col.rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.ref_rel_tn).join(
                col.rel_tn,
                `${col.rel_tn}.${col.rel_cn}`,
                `${col.ref_rel_tn}.${col.ref_rel_cn}`
              );

              lkPk = columnsObj[col.rel_tn]?.find(c => c.pk) || lkPk;
            } else if (col.type === 'bt') {
              // todo: decide based on type
              field = columnsObj[col.ref_rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.rel_tn).join(
                col.ref_rel_tn,
                `${col.ref_rel_tn}.${col.ref_rel_cn}`,
                `${col.rel_tn}.${col.rel_cn}`
              );

              lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk;
            } else if (col.type === 'mm') {
              // throw new Error('"m2m" lookup not implemented')

              // todo: decide based on type
              field = columnsObj[col.ref_rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.rel_tn)
                .join(
                  col.v_rel_tn,
                  `${col.v_rel_tn}.${col.v_rel_cn}`,
                  `${col.rel_tn}.${col.rel_cn}`
                )
                .join(
                  col.ref_rel_tn,
                  `${col.v_rel_tn}.${col.v_ref_rel_cn}`,
                  `${col.ref_rel_tn}.${col.ref_rel_cn}`
                );

              lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk;
            }

            while (field?.uidt === 'Lookup') {
              isArr = isArr || col.type !== 'bt';
              prev = field;

              if (field.type === 'hm') {
                lkQb.join(
                  field.rel_tn,
                  `${field.rel_tn}.${field.rel_cn}`,
                  `${field.ref_rel_tn}.${field.ref_rel_cn}`
                );
                lkPk = columnsObj[field.rel_tn]?.find(c => c.pk) || lkPk;
                field = columnsObj[field.rel_tn].find(
                  c => c.id === field.lookup_column_id
                );
              } else if (field.type === 'bt') {
                lkQb.join(
                  field.ref_rel_tn,
                  `${field.ref_rel_tn}.${field.ref_rel_cn}`,
                  `${field.rel_tn}.${field.rel_cn}`
                );
                lkPk = columnsObj[field.ref_rel_tn]?.find(c => c.pk) || lkPk;
                field = columnsObj[field.ref_rel_tn].find(
                  c => c.id === field.lookup_column_id
                );
              } else if (field.type === 'mm') {
                throw new Error('nested "m2m" lookup not implemented');
              }
            }

            // console.log(lkQb.toQuery())

            // check the look up column type
            //    if it's lookup
            //        construct query recursively
            //     else construct query

            const children = await knex.union(
              ids.map(id => {
                // lkQb.select(`${field.title}.${field.cn} as ${field.alias}`)

                let query;
                if (prev.type === 'hm') {
                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field.alias}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      lkPk.cn,
                      lkQb
                        .clone()
                        .select(`${lkPk.title}.${lkPk.cn}`)
                        .where(`${col.ref_rel_tn}.${pk.cn}`, id)
                    )
                    .limit(10);
                } else if (prev.type === 'bt') {
                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field.alias}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      prev.ref_rel_cn,
                      lkQb
                        .clone()
                        .select(`${prev.rel_tn}.${prev.rel_cn}`)
                        .where(`${pk.title}.${pk.cn}`, id)
                    )
                    .limit(10);
                } else if (prev.type === 'mm') {
                  // throw new Error('"m2m" lookup not implemented')

                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field.alias}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      prev.ref_rel_cn,
                      lkQb
                        .clone()
                        .select(`${prev.v_rel_tn}.${prev.v_ref_rel_cn}`)
                        .where(`${col.rel_tn}.${pk.cn}`, id)
                    )
                    .limit(10);
                }

                console.log(query.toQuery());

                return query;
              }),
              true
            );

            const gb = children.reduce((gb, r) => {
              if (prev.type === 'hm') {
                gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || [];
                gb[r[col.rel_cn]].push(r[field.alias]);
              } else if (prev.type === 'bt') {
                gb[r[pk.cn]] = gb[r[pk.cn]] || [];
                gb[r[pk.cn]].push(r[field.alias]);
              } else if (prev.type === 'mm') {
                // throw new Error('"m2m" lookup not implemented')
                gb[r[pk.cn]] = gb[r[pk.cn]] || [];
                gb[r[pk.cn]].push(r[field.alias]);
              }
              return gb;
            }, {});

            for (const d of data) {
              d[col.alias] = isArr
                ? gb[d[pk.alias]]
                : gb[d[pk.alias]] && gb[d[pk.alias]][0];
            }
          }
          break;
        case UITypes.Formula:
          break;
        default:
          break;
      }
    }*/
  }

  public async count(
    args: { where?: string; limit? } = {},
    ignoreFilterSort = false
  ): Promise<any> {
    await this.model.getColumns();
    const { where } = this._getListArgs(args);

    const qb = this.dbDriver(this.model.tn);

    qb.xwhere(where);

    /*    await qb.conditionv2(
          await Filter.getFilterObject({ modelId: this.model.id })
        );*/

    // todo: replace with view id
    if (!ignoreFilterSort) {
      await conditionV2(
        await Filter.rootFilterList({ viewId: this.viewId }),
        qb,
        this.dbDriver
      );

      // await sortV2(
      //   await Sort.list({ modelId: this.model.id }),
      //   qb,
      //   this.dbDriver
      // );
      // this._paginateAndSort(qb, rest);
    }

    qb.count(this.model.primaryKey.cn, {
      as: 'count'
    }).first();

    console.log(qb.toQuery());

    return ((await qb) as any).count;
  }

  /*  private async select(qb) {
    for (const col of await this.model.getColumns()) {
      switch (col.uidt) {
        case 'LinkToAnotherRecord':
        case 'Lookup':
        case 'Formula':
          break;
        default:
          qb.select(this.dbDriver.raw(`?? as ??`, [col.cn, col.alias]));
          break;
      }
    }
  }*/

  public defaultResolverReq(query?: any) {
    const fields = query?.fields || query?.f;

    if (fields && fields !== '*') {
      return fields.split(',').reduce((obj, f) => ({ ...obj, [f]: 1 }), {});
    }

    return this.model.getColumns().then(columns =>
      Promise.resolve(
        columns.reduce(
          (obj, o) => ({
            ...obj,
            [o._cn]: 1
          }),
          {}
        )
      )
    );
  }

  async hasManyListGQL({ colId, ids }) {
    try {
      /*      const {
        where,
        limit,
        offset,
        conditionGraph,
        sort
        // ...restArgs
      } = this.dbModels[child]._getChildListArgs(rest);*/
      // let { fields } = restArgs;
      // todo: get only required fields
      let fields = '*';

      // const { cn } = this.hasManyRelations.find(({ tn }) => tn === child) || {};
      const relColumn = (await this.model.getColumns()).find(
        c => c.id === colId
      );

      const chilCol = await ((await relColumn.getColOptions()) as LinkToAnotherRecordColumn).getChildColumn();
      const childTable = await chilCol.getModel();
      const childModel = await Model.getBaseModelSQL({
        model: childTable,
        dbDriver: this.dbDriver
      });
      // if (fields !== '*' && fields.split(',').indexOf(cn) === -1) {
      //   fields += ',' + cn;
      // }

      fields = fields
        .split(',')
        .map(c => `${chilCol.cn}.${c}`)
        .join(',');

      const qb = this.dbDriver(childTable.tn);
      await childModel.selectObject({ qb });

      const childs = await this.dbDriver.queryBuilder().from(
        this.dbDriver
          .union(
            ids.map(p => {
              const query = qb.clone().where({ [chilCol.cn]: p });
              // .select(...fields.split(','));;

              return this.isSqlite ? this.dbDriver.select().from(query) : query;
            }),
            !this.isSqlite
          )
          .as('list')
      );

      const proto = await (
        await Model.getBaseModelSQL({
          id: childTable.id,
          dbDriver: this.dbDriver
        })
      ).getProto();

      // return _.groupBy(childs, cn);
      return _.groupBy(
        childs.map(c => {
          c.__proto__ = proto;
          return c;
        }),
        chilCol._cn
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async hasManyListCount({ colId, ids }) {
    try {
      // const { cn } = this.hasManyRelations.find(({ tn }) => tn === child) || {};
      const relColumn = (await this.model.getColumns()).find(
        c => c.id === colId
      );

      const chilCol = await ((await relColumn.getColOptions()) as LinkToAnotherRecordColumn).getChildColumn();
      const chilMod = await chilCol.getModel();

      const childs = await this.dbDriver.unionAll(
        ids.map(p => {
          const query = this.dbDriver(chilMod.tn)
            .count(`${chilCol?.cn} as count`)
            .where({ [chilCol?.cn]: p })
            .first();
          return this.isSqlite ? this.dbDriver.select().from(query) : query;
        }),
        !this.isSqlite
      );

      return childs.map(({ count }) => count);
      // return _.groupBy(childs, cn);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async _getGroupedManyToManyList({ colId, parentIds }) {
    // const { where, limit, offset, sort, ...restArgs } = this._getChildListArgs(
    //   rest,
    //   index,
    //   child,
    //   'm'
    // );
    // const driver = trx || this.dbDriver;
    // let { fields } = restArgs;

    const relColumn = (await this.model.getColumns()).find(c => c.id === colId);
    const relColOptions = (await relColumn.getColOptions()) as LinkToAnotherRecordColumn;

    const tn = this.model.tn;
    // const cn = (await relColOptions.getChildColumn()).title;
    const vtn = (await relColOptions.getMMModel()).tn;
    const vcn = (await relColOptions.getMMChildColumn()).cn;
    const vrcn = (await relColOptions.getMMParentColumn()).cn;
    const rcn = (await relColOptions.getParentColumn()).cn;
    const childTable = await (await relColOptions.getParentColumn()).getModel();
    const childModel = await Model.getBaseModelSQL({
      dbDriver: this.dbDriver,
      model: childTable
    });
    const rtn = childTable.tn;

    // const { tn, cn, vtn, vcn, vrcn, rtn, rcn } =
    // @ts-ignore
    // const alias = this.dbModels[tn].columnToAlias?.[cn];

    // if (fields !== '*' && fields.split(',').indexOf(cn) === -1) {
    //   fields += ',' + cn;
    // }
    //
    // if (!this.dbModels[child]) {
    //   return;
    // }

    const qb = this.dbDriver(rtn)
      .join(vtn, `${vtn}.${vrcn}`, `${rtn}.${rcn}`)
      // p[this.columnToAlias?.[this.pks[0].title] || this.pks[0].title])
      // .xwhere(where, this.dbModels[child].selectQuery(''))
      .select({
        [`${tn}_${vcn}`]: `${vtn}.${vcn}`
        // ...this.dbModels[child].selectQuery(fields)
      });

    await childModel.selectObject({ qb });
    const childs = await this.dbDriver.union(
      parentIds.map(id => {
        // const query = this.dbDriver(rtn)
        //   .join(vtn, `${vtn}.${vrcn}`, `${rtn}.${rcn}`)
        //   .where(`${vtn}.${vcn}`, id) // p[this.columnToAlias?.[this.pks[0].title] || this.pks[0].title])
        //   // .xwhere(where, this.dbModels[child].selectQuery(''))
        //   .select(colSelect)
        //   .select({
        //     [`${tn}_${vcn}`]: `${vtn}.${vcn}`
        //     // ...this.dbModels[child].selectQuery(fields)
        //   }); // ...fields.split(','));
        const query = qb.clone().where(`${vtn}.${vcn}`, id);
        // this._paginateAndSort(query, { sort, limit, offset }, null, true);
        return this.isSqlite ? this.dbDriver.select().from(query) : query;
      }),
      !this.isSqlite
    );

    const proto = await (
      await Model.getBaseModelSQL({ tn: rtn, dbDriver: this.dbDriver })
    ).getProto();
    const gs = _.groupBy(
      childs.map(c => {
        c.__proto__ = proto;
        return c;
      }),
      `${tn}_${vcn}`
    );
    return parentIds.map(id => gs[id] || []);
  }

  async getProto() {
    if (this._proto) {
      return this._proto;
    }

    const proto: any = { __columnAliases: {} };
    const columns = await this.model.getColumns();
    for (const column of columns) {
      switch (column.uidt) {
        case UITypes.Rollup:
          {
            // @ts-ignore
            const colOptions: RollupColumn = await column.getColOptions();
          }
          break;
        case UITypes.Lookup:
          {
            // @ts-ignore
            const colOptions: LookupColumn = await column.getColOptions();
            proto.__columnAliases[column._cn] = {
              path: [
                (await Column.get({ colId: colOptions.fk_relation_column_id }))
                  ?._cn,
                (await Column.get({ colId: colOptions.fk_lookup_column_id }))
                  ?._cn
              ]
            };
          }
          break;
        case UITypes.LinkToAnotherRecord:
          {
            this._columns[column._cn] = column;
            const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;

            if (colOptions?.type === 'hm') {
              const listLoader = new DataLoader(async (ids: string[]) => {
                try {
                  const data = await this.hasManyListGQL({
                    colId: column.id,
                    ids
                  });
                  return ids.map((id: string) => (data[id] ? data[id] : []));
                } catch (e) {
                  console.log(e);
                  return [];
                }
              });
              const self: BaseModelSqlv2 = this;

              proto[column._cn] = async function(): Promise<any> {
                return listLoader.load(this[self?.model?.primaryKey?._cn]);
              };

              // defining HasMany count method within GQL Type class
              // Object.defineProperty(type.prototype, column.alias, {
              //   async value(): Promise<any> {
              //     return listLoader.load(this[model.pk.alias]);
              //   },
              //   configurable: true
              // });
            } else if (colOptions.type === 'mm') {
              const listLoader = new DataLoader(async (ids: string[]) => {
                try {
                  const data = await this._getGroupedManyToManyList({
                    parentIds: ids,
                    colId: column.id
                  });

                  return data;
                } catch (e) {
                  console.log(e);
                  return [];
                }
              });

              const self: BaseModelSqlv2 = this;

              proto[column._cn] = async function(): Promise<any> {
                return await listLoader.load(this[self.model.primaryKey._cn]);
              };
            } else if (colOptions.type === 'bt') {
              // @ts-ignore
              const colOptions = (await column.getColOptions()) as LinkToAnotherRecordColumn;
              const pCol = await Column.get({
                colId: colOptions.fk_parent_column_id
              });
              const cCol = await Column.get({
                colId: colOptions.fk_child_column_id
              });
              const readLoader = new DataLoader(async (ids: string[]) => {
                try {
                  const data = await (
                    await Model.getBaseModelSQL({
                      id: pCol.fk_model_id,
                      dbDriver: this.dbDriver
                    })
                  ).list(
                    {
                      // limit: ids.length,
                      where: `(${pCol.cn},in,${ids.join(',')})`
                    },
                    true
                  );
                  const gs = _.groupBy(data, pCol._cn);
                  return ids.map(async (id: string) => gs?.[id]?.[0]);
                } catch (e) {
                  console.log(e);
                  return [];
                }
              });

              // defining HasMany count method within GQL Type class
              proto[column._cn] = async function() {
                return (
                  this?.[cCol?._cn] !== null &&
                  this?.[cCol?._cn] != undefined &&
                  (await readLoader.load(this?.[cCol?._cn]))
                );
              };
              // todo : handle mm
            }
          }
          break;
      }
    }
    this._proto = proto;
    return proto;
  }

  _getListArgs(args: XcFilterWithAlias): XcFilter {
    const obj: XcFilter = {};
    obj.where = args.where || args.w || '';
    obj.having = args.having || args.h || '';
    obj.condition = args.condition || args.c || {};
    obj.conditionGraph = args.conditionGraph || {};
    obj.limit = Math.max(
      Math.min(
        args.limit || args.l || this.config.limitDefault,
        this.config.limitMax
      ),
      this.config.limitMin
    );
    obj.offset = Math.max(+(args.offset || args.o) || 0, 0);
    obj.fields = args.fields || args.f || '*';
    obj.sort = args.sort || args.s || this.model.primaryKey?.[0]?.tn;
    return obj;
  }

  _paginateAndSort(
    query,
    {
      limit = 20,
      offset = 0,
      // sort = '',
      ignoreLimit = false
    }: XcFilter & { ignoreLimit?: boolean }
  ) {
    query.offset(offset);
    if (!ignoreLimit) query.limit(limit);

    // if (!table && !sort && this.db === 'mssql' && !isUnion) {
    //   sort =         this.model.pk?.alias;
    // }

    /*    if (sort) {
      sort.split(',').forEach(o => {
        if (o[0] === '-') {
          query.orderBy(
            this.selectObject({})[o.slice(1)] || o.slice(1),
            'desc'
          );
        } else {
          query.orderBy(this.selectObject({})[o] || o, 'asc');
        }
      });
    }*/

    return query;
  }

  // protected get selectFormulas() {
  //   if (!this._selectFormulas) {
  //     this._selectFormulas = (this.virtualColumns || [])?.reduce((arr, v) => {
  //       if (v.formula?.value && !v.formula?.error?.length) {
  //         arr.push(
  //           formulaQueryBuilder(
  //             v.formula?.tree,
  //             v.alias,
  //             this.dbDriver,
  //             this.aliasToColumn
  //           )
  //         );
  //       }
  //       return arr;
  //     }, []);
  //   }
  //   return this._selectFormulas;
  // }
  //
  // protected get selectFormulasObj() {
  //   if (!this._selectFormulasObj) {
  //     this._selectFormulasObj = (this.virtualColumns || [])?.reduce(
  //       (obj, v) => {
  //         if (v.formula?.value && !v.formula?.error?.length) {
  //           obj[v.alias] = formulaQueryBuilder(
  //             v.formula?.tree,
  //             null,
  //             this.dbDriver,
  //             this.aliasToColumn
  //           );
  //         }
  //         return obj;
  //       },
  //       {}
  //     );
  //   }
  //   return this._selectFormulasObj;
  // }

  // todo: optimize
  // protected get selectRollups() {
  //   return (this.virtualColumns || [])?.reduce((arr, v) => {
  //     if (v.rl) {
  //       arr.push(
  //         genRollupSelectv2({
  //           tn: this.tn,
  //           knex: this.dbDriver,
  //           rollup: v.rl,
  //           hasMany: this.hasManyRelations,
  //           manyToMany: this.manyToManyRelations
  //         }).as(v.alias)
  //       );
  //     }
  //     return arr;
  //   }, []);
  // }

  public async selectObject({ qb }: { qb: QueryBuilder }): Promise<void> {
    const res = {};
    const columns = await this.model.getColumns();
    for (const column of columns) {
      switch (column.uidt) {
        case 'LinkToAnotherRecord':
        case 'Lookup':
          break;
        case 'Formula':
          {
            const formula = await column.getColOptions<FormulaColumn>();
            const selectQb = await formulaQueryBuilderv2(
              formula.formula,
              null,
              this.dbDriver,
              this.model
              // this.aliasToColumn
            );
            // todo:  verify syntax of as ? / ??
            qb.select(
              this.dbDriver.raw(`?? as ??`, [selectQb.builder, column._cn])
            );
          }
          break;
        case 'Rollup':
          qb.select(
            (
              await genRollupSelectv2({
                // tn: this.title,
                knex: this.dbDriver,
                // column,
                columnOptions: (await column.getColOptions()) as RollupColumn
              })
            ).builder.as(column._cn)
          );
          break;
        default:
          res[column._cn || column.cn] = `${this.model.tn}.${column.cn}`;
          break;
      }
    }
    qb.select(res);
  }

  async insert(data) {
    try {
      const insertObj = await this.model.mapAliasToColumn(data);

      // if ('beforeInsert' in this) {
      //   await this.beforeInsert(insertObj, trx, cookie);
      // }
      await this.model.getColumns();
      let response;
      // const driver = trx ? trx : this.dbDriver;

      // await this.validate(insertObj);

      const query = this.dbDriver(this.tnPath).insert(insertObj);

      if (this.isPg || this.isMssql) {
        query.returning(
          `${this.model.primaryKey.cn} as ${this.model.primaryKey._cn}`
        );
        response = await query;
      }

      const ai = this.model.columns.find(c => c.ai);
      if (
        !response ||
        (typeof response?.[0] !== 'object' && response?.[0] !== null)
      ) {
        let id;
        if (response?.length) {
          id = response[0];
        } else {
          id = (await query)[0];
        }

        if (ai) {
          // response = await this.readByPk(id)
          response = await this.readByPk(id);
        } else {
          response = data;
        }
      } else if (ai) {
        response = await this.readByPk(
          Array.isArray(response) ? response?.[0]?.[ai._cn] : response?.[ai._cn]
        );
      }

      // await this.afterInsert(response, trx, cookie);
      return Array.isArray(response) ? response[0] : response;
    } catch (e) {
      console.log(e);
      // await this.errorInsert(e, data, trx, cookie);
      throw e;
    }
  }

  async delByPk(id) {
    try {
      // await this.beforeDelete(id, trx, cookie);

      const response = await this.dbDriver(this.tnPath)
        .del()
        .where(await this._wherePk(id));
      // await this.afterDelete(response, trx, cookie);
      return response;
    } catch (e) {
      console.log(e);
      // await this.errorDelete(e, id, trx, cookie);
      throw e;
    }
  }

  async updateByPk(id, data) {
    try {
      const updateObj = await this.model.mapAliasToColumn(data);

      // await this.validate(data);

      // await this.beforeUpdate(data, trx, cookie);

      // const driver = trx ? trx : this.dbDriver;

      // this.validate(data);
      // await this._run(
      await this.dbDriver(this.tnPath)
        .update(updateObj)
        .where(await this._wherePk(id));
      // );

      const response = await this.readByPk(id);
      // await this.afterUpdate(response, trx, cookie);
      return response;
    } catch (e) {
      console.log(e);
      // await this.errorUpdate(e, data, trx, cookie);
      throw e;
    }
  }

  async _wherePk(id) {
    await this.model.getColumns();
    // const ids = (id + '').split('___');
    // const where = {};
    // // for (let i = 0; i < this.model.length; ++i) {
    //   where[this.model?.[i]?.cn] = ids[i];
    // }
    return { [this.model.primaryKey.cn]: id };
  }

  public get tnPath() {
    const schema = (this.dbDriver as any).searchPath?.();
    const table =
      this.isMssql && schema
        ? this.dbDriver.raw('??.??', [schema, this.model.tn])
        : this.model.tn;
    return table;
  }

  get isSqlite() {
    return this.clientType === 'sqlite3';
  }

  get isMssql() {
    return this.clientType === 'mssql';
  }
  get isPg() {
    return this.clientType === 'pg';
  }

  get clientType() {
    return this.dbDriver.clientType();
  }
}

export { BaseModelSqlv2 };
/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
