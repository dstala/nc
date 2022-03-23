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
import View from '../../../noco-models/View';
import {
  AuditOperationSubTypes,
  AuditOperationTypes,
  isSystemColumn,
  RelationTypes,
  SortType,
  ViewTypes
} from 'nc-common';
import formSubmissionEmailTemplate from '../../../noco/common/formSubmissionEmailTemplate';
import ejs from 'ejs';
import Audit from '../../../noco-models/Audit';
import FormView from '../../../noco-models/FormView';
import Hook from '../../../noco-models/Hook';
import NcPluginMgrv2 from '../../../noco/meta/api/helpers/NcPluginMgrv2';
import {
  _transformSubmittedFormDataForEmail,
  invokeWebhook,
  parseBody
} from '../../../noco/meta/api/helpers/webhookHelpers';
import Validator from 'validator';
import { NcError } from '../../../noco/meta/api/helpers/catchError';

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
    args: {
      where?: string;
      limit?;
      offset?;
      filterArr?: Filter[];
      sortArr?: Sort[];
      sort?: string | string[];
    } = {},
    ignoreFilterSort = false
  ): Promise<any> {
    const { where, ...rest } = this._getListArgs(args as any);

    const qb = this.dbDriver(this.model.tn);
    await this.selectObject({ qb });
    // qb.xwhere(where, await this.model.getAliasColMapping());

    const aliasColObjMap = (await this.model.getColumns()).reduce(
      (sortAgg, c) => ({ ...sortAgg, [c._cn]: c }),
      {}
    );

    let sorts = extractSortsObject(args?.sort, aliasColObjMap);

    const filterObj = extractFilterFromXwhere(args?.where, aliasColObjMap);

    // todo: replace with view id
    if (!ignoreFilterSort && this.viewId) {
      await conditionV2(
        [
          new Filter({
            children:
              (await Filter.rootFilterList({ viewId: this.viewId })) || [],
            is_group: true
          }),
          new Filter({
            children: args.filterArr || [],
            is_group: true,
            logical_op: 'and'
          }),
          new Filter({
            children: filterObj,
            is_group: true,
            logical_op: 'and'
          }),
          ...(args.filterArr || [])
        ],
        qb,
        this.dbDriver
      );

      if (!sorts)
        sorts = args.sortArr?.length
          ? args.sortArr
          : await Sort.list({ viewId: this.viewId });

      await sortV2(sorts, qb, this.dbDriver);

      // sort by primary key by default
      if (!sorts?.length && this.model.primaryKey) {
        qb.orderBy(this.model.primaryKey.cn);
      }
    } else {
      await conditionV2(
        [
          new Filter({
            children: args.filterArr || [],
            is_group: true,
            logical_op: 'and'
          }),
          new Filter({
            children: filterObj,
            is_group: true,
            logical_op: 'and'
          }),
          ...(args.filterArr || [])
        ],
        qb,
        this.dbDriver
      );

      if (!sorts) sorts = args.sortArr;

      await sortV2(sorts, qb, this.dbDriver);

      // sort by primary key by default
      if (this.model.primaryKey) {
        qb.orderBy(this.model.primaryKey.cn);
      }
    }

    applyPaginate(qb, rest);
    const proto = await this.getProto();

    console.log(qb.toQuery());

    return (await qb).map(d => {
      d.__proto__ = proto;
      return d;
    });
  }

  public async count(
    args: { where?: string; limit?; filterArr?: Filter[] } = {},
    ignoreFilterSort = false
  ): Promise<any> {
    await this.model.getColumns();
    const { where } = this._getListArgs(args);

    const qb = this.dbDriver(this.model.tn);

    // qb.xwhere(where, await this.model.getAliasColMapping());

    const aliasColObjMap = (await this.model.getColumns()).reduce(
      (sortAgg, c) => ({ ...sortAgg, [c._cn]: c }),
      {}
    );
    const filterObj = extractFilterFromXwhere(where, aliasColObjMap);

    // todo: replace with view id
    if (!ignoreFilterSort && this.viewId) {
      await conditionV2(
        [
          new Filter({
            children:
              (await Filter.rootFilterList({ viewId: this.viewId })) || [],
            is_group: true
          }),
          new Filter({
            children: args.filterArr || [],
            is_group: true,
            logical_op: 'and'
          }),
          new Filter({
            children: filterObj,
            is_group: true,
            logical_op: 'and'
          }),
          ...(args.filterArr || [])
        ],
        qb,
        this.dbDriver
      );
    } else {
      await conditionV2(
        [
          new Filter({
            children: args.filterArr || [],
            is_group: true,
            logical_op: 'and'
          }),
          new Filter({
            children: filterObj,
            is_group: true,
            logical_op: 'and'
          }),
          ...(args.filterArr || [])
        ],
        qb,
        this.dbDriver
      );
    }

    qb.count(this.model.primaryKey?.cn || '*', {
      as: 'count'
    }).first();

    console.log(qb.toQuery());

    return ((await qb) as any).count;
  }

  public async defaultResolverReq(
    query?: any,
    extractOnlyPrimaries = false,
    includePkByDefault = true
  ) {
    await this.model.getColumns();
    if (extractOnlyPrimaries) {
      return {
        [this.model.primaryKey._cn]: 1,
        [this.model.primaryValue._cn]: 1
      };
    }

    let fields = query?.fields || query?.f;
    if (fields && fields !== '*') {
      fields = Array.isArray(fields) ? fields : fields.split(',');
    } else {
      fields = null;
    }

    let allowedCols = null;
    if (this.viewId)
      allowedCols = (await View.getColumns(this.viewId)).reduce(
        (o, c) => ({
          ...o,
          [c.fk_column_id]: c.show
        }),
        {}
      );

    const view = await View.get(this.viewId);

    return this.model.getColumns().then(columns =>
      Promise.resolve(
        columns.reduce(
          (obj, col) => ({
            ...obj,
            [col._cn]:
              allowedCols && (!includePkByDefault || !col.pk)
                ? allowedCols[col.id] &&
                  (!isSystemColumn(col) || view.show_system_fields) &&
                  (!fields?.length || fields.include(col._cn))
                : 1
          }),
          {}
        )
      )
    );
  }

  async hmList({ colId, ids }, args?: { limit?; offset? }) {
    try {
      // const {
      //   where,
      //   limit,
      //   offset,
      //   conditionGraph,
      //   sort
      //   // ...restArgs
      // } = this.dbModels[child]._getChildListArgs(args);
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
              // .select(...fields.split(','));
              // todo: sanitize
              query.limit(args?.limit || 20);
              query.offset(args?.offset || 0);

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

  async hmListCount({ colId, ids }) {
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

  public async mmList({ colId, parentIds }, args?: { limit; offset }) {
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

        // todo: sanitize
        query.limit(args?.limit || 20);
        query.offset(args?.offset || 0);

        // this._paginateAndSort(query, params);
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

  public async mmListCount({ colId, parentIds }) {
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
    // const childModel = await Model.getBaseModelSQL({
    //   dbDriver: this.dbDriver,
    //   model: childTable
    // });
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
      })
      .count(`*`, { as: 'count' })
      .groupBy(`${vtn}.${vcn}`);

    // await childModel.selectObject({ qb });
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
            const parentColumn = await colOptions.getParentColumn();

            if (colOptions?.type === 'hm') {
              const listLoader = new DataLoader(async (ids: string[]) => {
                try {
                  const data = await this.hmList(
                    {
                      colId: column.id,
                      ids
                    },
                    (listLoader as any).args
                  );
                  return ids.map((id: string) => (data[id] ? data[id] : []));
                } catch (e) {
                  console.log(e);
                  return [];
                }
              });
              const self: BaseModelSqlv2 = this;

              proto[column._cn] = async function(args): Promise<any> {
                (listLoader as any).args = args;
                return listLoader.load(
                  this[parentColumn?._cn || self?.model?.primaryKey?._cn]
                );
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
                  const data = await this.mmList(
                    {
                      parentIds: ids,
                      colId: column.id
                    },
                    (listLoader as any).args
                  );

                  return data;
                } catch (e) {
                  console.log(e);
                  return [];
                }
              });

              const self: BaseModelSqlv2 = this;
              const childColumn = await colOptions.getChildColumn();
              proto[column._cn] = async function(args): Promise<any> {
                (listLoader as any).args = args;
                return await listLoader.load(
                  this[childColumn?._cn || self.model.primaryKey._cn]
                );
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
            if (formula.error) continue;
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

  async insert(data, trx?, cookie?) {
    try {
      // todo: filter based on view
      const insertObj = await this.model.mapAliasToColumn(data);

      await this.validate(insertObj);

      if ('beforeInsert' in this) {
        await this.beforeInsert(insertObj, trx, cookie);
      }

      // if ('beforeInsert' in this) {
      //   await this.beforeInsert(insertObj, trx, cookie);
      // }
      await this.model.getColumns();
      let response;
      // const driver = trx ? trx : this.dbDriver;

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

      await this.afterInsert(response, trx, cookie);
      return Array.isArray(response) ? response[0] : response;
    } catch (e) {
      console.log(e);
      await this.errorInsert(e, data, trx, cookie);
      throw e;
    }
  }

  async delByPk(id, trx?, cookie?) {
    try {
      await this.beforeDelete(id, trx, cookie);

      const response = await this.dbDriver(this.tnPath)
        .del()
        .where(await this._wherePk(id));
      await this.afterDelete(response, trx, cookie);
      return response;
    } catch (e) {
      console.log(e);
      await this.errorDelete(e, id, trx, cookie);
      throw e;
    }
  }

  async updateByPk(id, data, trx?, cookie?) {
    try {
      const updateObj = await this.model.mapAliasToColumn(data);

      await this.validate(data);

      await this.beforeUpdate(data, trx, cookie);

      // const driver = trx ? trx : this.dbDriver;
      //
      // this.validate(data);
      // await this._run(
      await this.dbDriver(this.tnPath)
        .update(updateObj)
        .where(await this._wherePk(id));
      // );

      const response = await this.readByPk(id);
      await this.afterUpdate(response, trx, cookie);
      return response;
    } catch (e) {
      console.log(e);
      await this.errorUpdate(e, data, trx, cookie);
      throw e;
    }
  }

  async _wherePk(id) {
    await this.model.getColumns();
    const ids = (id + '').split('___');
    const where = {};
    for (let i = 0; i < this.model.primaryKeys.length; ++i) {
      where[this.model.primaryKeys[i].cn] = ids[i];
    }
    return where;
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

  async nestedInsert(data, _trx = null, cookie?) {
    // const driver = trx ? trx : await this.dbDriver.transaction();
    try {
      const insertObj = await this.model.mapAliasToColumn(data);

      let rowId = null;
      const postInsertOps = [];

      const nestedCols = (await this.model.getColumns()).filter(
        c => c.uidt === UITypes.LinkToAnotherRecord
      );

      for (const col of nestedCols) {
        if (col._cn in data) {
          const colOptions = await col.getColOptions<
            LinkToAnotherRecordColumn
          >();

          // parse data if it's JSON string
          const nestedData =
            typeof data[col._cn] === 'string'
              ? JSON.parse(data[col._cn])
              : data[col._cn];

          switch (colOptions.type) {
            case RelationTypes.BELONGS_TO:
              {
                const parentCol = await colOptions.getParentColumn();
                insertObj[parentCol.cn] = nestedData?.[parentCol._cn];
              }
              break;
            case RelationTypes.HAS_MANY:
              {
                const childCol = await colOptions.getChildColumn();
                const childModel = await childCol.getModel();
                await childModel.getColumns();

                postInsertOps.push(async () => {
                  await this.dbDriver(childModel.tn)
                    .update({
                      [childCol.cn]: rowId
                    })
                    .whereIn(
                      childModel.primaryKey.cn,
                      nestedData?.map(r => r[childModel.primaryKey._cn])
                    );
                });
              }
              break;
            case RelationTypes.MANY_TO_MANY: {
              postInsertOps.push(async () => {
                const parentModel = await colOptions
                  .getParentColumn()
                  .then(c => c.getModel());
                await parentModel.getColumns();
                const parentMMCol = await colOptions.getMMParentColumn();
                const childMMCol = await colOptions.getMMChildColumn();
                const mmModel = await colOptions.getMMModel();

                const rows = nestedData.map(r => ({
                  [parentMMCol.cn]: r[parentModel.primaryKey._cn],
                  [childMMCol.cn]: rowId
                }));
                await this.dbDriver(mmModel.tn).insert(rows);
              });
            }
          }
        }
      }

      await this.validate(insertObj);

      await this.beforeInsert(insertObj, this.dbDriver, cookie);

      let response;
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
      response = Array.isArray(response) ? response[0] : response;
      if (response)
        rowId =
          response[this.model.primaryKey._cn] ||
          response[this.model.primaryKey.cn];
      await Promise.all(postInsertOps.map(f => f()));

      // if (!trx) {
      //   await driver.commit();
      // }

      await this.afterInsert(response, this.dbDriver, cookie);

      return response;
    } catch (e) {
      console.log(e);
      // await this.errorInsert(e, data, trx, cookie);
      // if (!trx) {
      //   await driver.rollback(e);
      // }
      throw e;
    }
  }

  async bulkInsert(datas: any[]) {
    // todo : start transaction
    // iterate and insert

    for (const _data of datas) {
    }
  }

  /**
   *  Hooks
   * */

  public async beforeInsert(data: any, _trx: any, req): Promise<void> {
    await this.handleHooks('Before.insert', data, req);
  }

  public async afterInsert(data: any, _trx: any, req): Promise<void> {
    await this.handleHooks('After.insert', data, req);
    // if (req?.headers?.['xc-gui']) {
    const id = this._extractPksValues(data);
    Audit.insert({
      fk_model_id: this.model.id,
      row_id: id,
      op_type: AuditOperationTypes.DATA,
      op_sub_type: AuditOperationSubTypes.INSERT,
      description: `${id} inserted into ${this.model._tn}`,
      // details: JSON.stringify(data),
      ip: req?.clientIp,
      user: req?.user?.email
    });
    // }
  }

  public async beforeUpdate(data: any, _trx: any, req): Promise<void> {
    await this.handleHooks('Before.update', data, req);
  }

  public async afterUpdate(data: any, _trx: any, req): Promise<void> {
    await this.handleHooks('After.update', data, req);
  }

  public async beforeDelete(data: any, _trx: any, req): Promise<void> {
    await this.handleHooks('Before.delete', data, req);
  }

  public async afterDelete(data: any, _trx: any, req): Promise<void> {
    // if (req?.headers?.['xc-gui']) {
    const id = req?.params?.id;
    Audit.insert({
      fk_model_id: this.model.id,
      row_id: id,
      op_type: AuditOperationTypes.DATA,
      op_sub_type: AuditOperationSubTypes.DELETE,
      description: `${id} deleted from ${this.model._tn}`,
      // details: JSON.stringify(data),
      ip: req?.clientIp,
      user: req?.user?.email
    });
    // }
    await this.handleHooks('After.delete', data, req);
  }

  private async handleHooks(hookName, data, req): Promise<void> {
    // const data = _data;

    const view = await View.get(this.viewId);

    // handle form view data submission
    if (hookName === 'After.insert' && view.type === ViewTypes.FORM) {
      try {
        const formView = await view.getView<FormView>();
        const emails = Object.entries(JSON.parse(formView?.email) || {})
          .filter(a => a[1])
          .map(a => a[0]);
        if (emails?.length) {
          const transformedData = _transformSubmittedFormDataForEmail(
            data,
            formView,
            await this.model.getColumns()
          );
          // todo: notification template
          (await NcPluginMgrv2.emailAdapter())?.mailSend({
            to: emails.join(','),
            subject: parseBody('NocoDB Form', req, data, {}),
            html: ejs.render(formSubmissionEmailTemplate, {
              data: transformedData,
              tn: this.model.tn,
              _tn: this.model._tn
            })
          });
        }
      } catch (e) {
        console.log(e);
      }
    }

    try {
      const [event, operation] = hookName.split('.');
      const hooks = await Hook.list({
        fk_model_id: this.model.id,
        event,
        operation
      });
      for (const hook of hooks) {
        invokeWebhook(hook, this.model, data, req?.user);
      }
    } catch (e) {
      console.log('hooks :: error', hookName, e);
    }
  }

  // @ts-ignore
  protected async errorInsert(e, data, trx, cookie) {}

  // @ts-ignore
  protected async errorUpdate(e, data, trx, cookie) {}

  // todo: handle composite primary key
  protected _extractPksValues(data: any) {
    // data can be still inserted without PK
    // TODO: return a meaningful value
    if (!this.model.primaryKey) return 'N/A';
    return data[this.model.primaryKey._cn];
  }

  // @ts-ignore
  protected async errorDelete(e, id, trx, cookie) {}

  async validate(columns) {
    await this.model.getColumns();
    // let cols = Object.keys(this.columns);
    for (let i = 0; i < this.model.columns.length; ++i) {
      const column = this.model.columns[i];
      const validate = column.getValidators();
      const cn = column.cn;
      if (!validate) continue;
      const { func, msg } = validate;
      for (let j = 0; j < func.length; ++j) {
        const fn = typeof func[j] === 'string' ? Validator[func[j]] : func[j];
        const arg =
          typeof func[j] === 'string' ? columns[cn] + '' : columns[cn];
        if (
          columns[cn] !== null &&
          columns[cn] !== undefined &&
          columns[cn] !== '' &&
          cn in columns &&
          !(fn.constructor.name === 'AsyncFunction' ? await fn(arg) : fn(arg))
        ) {
          NcError.badRequest(
            msg[j].replace(/\{VALUE}/g, columns[cn]).replace(/\{cn}/g, cn)
          );
        }
      }
    }
    return true;
  }
}

function extractSortsObject(
  _sorts: string | string[],
  aliasColObjMap: { [columnAlias: string]: Column }
): Sort[] | void {
  if (!_sorts?.length) return;

  let sorts = _sorts;

  if (!Array.isArray(sorts)) sorts = sorts.split(',');

  return sorts.map(s => {
    const sort: SortType = { direction: 'asc' };
    if (s.startsWith('-')) {
      sort.direction = 'desc';
      sort.fk_column_id = aliasColObjMap[s.slice(1)]?.id;
    } else sort.fk_column_id = aliasColObjMap[s]?.id;

    return new Sort(sort);
  });
}

function extractFilterFromXwhere(
  str,
  aliasColObjMap: { [columnAlias: string]: Column }
) {
  if (!str) {
    return [];
  }

  let nestedArrayConditions = [];

  let openIndex = str.indexOf('((');

  if (openIndex === -1) openIndex = str.indexOf('(~');

  let nextOpenIndex = openIndex;
  let closingIndex = str.indexOf('))');

  // if it's a simple query simply return array of conditions
  if (openIndex === -1) {
    if (str && str != '~not')
      nestedArrayConditions = str.split(
        /(?=~(?:or(?:not)?|and(?:not)?|not)\()/
      );
    return extractCondition(nestedArrayConditions || [], aliasColObjMap);
  }

  // iterate until finding right closing
  while (
    (nextOpenIndex = str
      .substring(0, closingIndex)
      .indexOf('((', nextOpenIndex + 1)) != -1
  ) {
    closingIndex = str.indexOf('))', closingIndex + 1);
  }

  if (closingIndex === -1)
    throw new Error(
      `${str
        .substring(0, openIndex + 1)
        .slice(-10)} : Closing bracket not found`
    );

  // getting operand starting index
  const operandStartIndex = str.lastIndexOf('~', openIndex);
  const operator =
    operandStartIndex != -1
      ? str.substring(operandStartIndex + 1, openIndex)
      : '';
  const lhsOfNestedQuery = str.substring(0, openIndex);

  nestedArrayConditions.push(
    ...extractFilterFromXwhere(lhsOfNestedQuery, aliasColObjMap),
    // calling recursively for nested query
    new Filter({
      is_group: true,
      logical_op: operator,
      children: extractFilterFromXwhere(
        str.substring(openIndex + 1, closingIndex + 1),
        aliasColObjMap
      )
    }),
    // RHS of nested query(recursion)
    ...extractFilterFromXwhere(str.substring(closingIndex + 2), aliasColObjMap)
  );
  return nestedArrayConditions;
}

function extractCondition(nestedArrayConditions, aliasColObjMap) {
  return nestedArrayConditions?.map(str => {
    // eslint-disable-next-line prefer-const
    let [logicOp, alias, op, value] = str
      .match(/(?:~(and|or|not))?\((.*?),(\w+),(.*)\)/)
      .slice(1);
    if (op === 'is') op = 'is' + value;
    else if (op === 'in') value = value.split(',');

    return new Filter({
      comparison_op: op,
      fk_column_id: aliasColObjMap[alias]?.id,
      logical_op: logicOp,
      value
    });
  });
}

function applyPaginate(
  query,
  {
    limit = 20,
    offset = 0,
    ignoreLimit = false
  }: XcFilter & { ignoreLimit?: boolean }
) {
  query.offset(offset);
  if (!ignoreLimit) query.limit(limit);

  return query;
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
