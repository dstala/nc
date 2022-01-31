import { nocoExecute } from '../noco-resolver/NocoExecute';
import { Router } from 'express';
import Model from '../../noco-models/Model';
import Column from '../../noco-models/Column';
import UITypes from '../../sqlUi/UITypes';
import LookupColumn from '../../noco-models/LookupColumn';
import RollupColumn from '../../noco-models/RollupColumn';
import Filter from '../../noco-models/Filter';
import Sort from '../../noco-models/Sort';
import LinkToAnotherRecordColumn from '../../noco-models/LinkToAnotherRecordColumn';
import jsep from 'jsep';
import jsepTreeToFormula from '../common/helpers/jsepTreeToFormula';
import FormulaColumn from '../../noco-models/FormulaColumn';
import Noco from '../Noco';

export default function registerRestCtrl(ctx: {
  router: Router;
  baseId: string;
  dbAlias: string;
  // baseModels2: {
  //   [key: string]: BaseModelSqlv2;
  // };
  dbDriver: any;
}) {
  const router = Router();

  router.get('/api/v2/:model_name', async (req: any, res) => {
    try {
      console.time('Model.get');
      const model = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        id: req.params.model_id,
        tn: req.params.model_name
      });
      console.timeEnd('Model.get');

      console.time('BaseModel.get');
      const baseModel = await Model.getBaseModelSQL({
        id: model.id,
        dbDriver: ctx.dbDriver
      });
      console.timeEnd('BaseModel.get');

      console.time('BaseModel.defaultResolverReq');
      const requestObj = {
        [`${model.alias}List`]: await baseModel.defaultResolverReq(req.query)
      };
      console.timeEnd('BaseModel.defaultResolverReq');

      console.time('nocoExecute');
      const data = await nocoExecute(
        requestObj,
        {
          [`${model.alias}List`]: async args => {
            // console.log(
            //   JSON.stringify(
            //     await Filter.getFilterObject({ modelId: model.id }),
            //     null,
            //     2
            //   )
            // );

            return await baseModel.list(args);
          }
        },
        {},
        req.query
      );
      console.timeEnd('nocoExecute');

      res.json(data);
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });
  router.get('/api/v2/:model_name/:id', async (req: any, res) => {
    try {
      const model = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        id: req.params.model_id,
        tn: req.params.model_name
      });

      const baseModel = await Model.getBaseModelSQL({
        id: model.id,
        dbDriver: ctx.dbDriver
      });

      res.json(
        await nocoExecute(
          {
            [`${model.alias}Read`]: await baseModel.defaultResolverReq(
              req?.query
            )
          },
          {
            [`${model.alias}Read`]: async id => {
              return await baseModel.readByPk(id);
              // return row ? new ctx.types[model.title](row) : null;
            }
          },
          {},
          req.params.id
        )
      );
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });

  router.post('/generateLookup', async (_req: any, res) => {
    try {
      let country = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'country'
      });
      let city = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'city'
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        _cn: 'addressList',
        fk_model_id: country.id,
        ui_data_type: UITypes.Lookup,
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c.alias === 'City => Address'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c.ui_data_type === UITypes.LinkToAnotherRecord
        )?.id
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        _cn: 'CityNames',
        fk_model_id: country.id,
        ui_data_type: UITypes.Lookup,
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c.title === 'city'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c.ui_data_type === UITypes.LinkToAnotherRecord
        )?.id
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: city.id,
        ui_data_type: UITypes.Lookup,
        _cn: 'Country Name',
        fk_lookup_column_id: (await country.getColumns()).find(
          c => c.alias === 'Country'
        )?.id,
        fk_relation_column_id: (await city.getColumns()).find(
          c => c.alias === 'Country <= City'
        )?.id
      });

      await Model.clear({ id: city.id });
      await Model.clear({ id: country.id });

      country = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'country'
      });
      city = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'city'
      });

      let address = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'address'
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: address.id,
        ui_data_type: UITypes.Lookup,
        _cn: 'Country Name',
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c.alias === 'Country Name'
        )?.id,
        fk_relation_column_id: (await address.getColumns()).find(
          c => c.alias === 'City <= Address'
        )?.id
      });

      // Rollup
      await Column.insert<RollupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: country.id,
        ui_data_type: UITypes.Rollup,
        _cn: 'CityCount',
        fk_rollup_column_id: (await city.getColumns()).find(
          c => c.alias === 'CityId'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c.alias === 'Country => City'
        )?.id,
        rollup_function: 'count'
      });

      await Model.clear({ id: city.id });
      await Model.clear({ id: country.id });

      country = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'country'
      });
      city = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'city'
      });

      // Filter
      await Filter.insert({
        fk_model_id: country.id,
        logical_op: 'OR',
        is_group: true,
        children: [
          {
            fk_model_id: country.id,
            fk_column_id: (await country.getColumns())?.find(
              c => c.alias === 'CityCount'
            )?.id,
            comparison_op: 'eq',
            value: '1'
          }
          // {
          //   fk_model_id: country.id,
          //   fk_column_id: (await country.getColumns())?.find(
          //     c => c.alias === 'addressList'
          //   )?.id,
          //   comparison_op: 'like',
          //   value: '%1836%'
          // }
          // {
          //   fk_model_id: country.id,
          //   fk_column_id: (await country.getColumns())?.find(
          //     c => c.alias === 'Country => City'
          //   )?.id,
          //   comparison_op: 'like',
          //   value: '%ban%'
          // },
          // {
          //   fk_model_id: country.id,
          //   logical_op: 'AND',
          //   is_group: true,
          //   children: [
          //     {
          //       fk_model_id: country.id,
          //       fk_column_id: (await country.getColumns())?.find(
          //         c => c.title === 'country'
          //       )?.id,
          //       comparison_op: 'like',
          //       value: 'z%'
          //     },
          //     {
          //       fk_model_id: country.id,
          //       fk_column_id: (await country.getColumns())?.find(
          //         c => c.title === 'country'
          //       )?.id,
          //       comparison_op: 'like',
          //       value: '%a'
          //     }
          //   ]
          // }
        ]
      });

      // city - filter
      // await Filter.insert({
      //   fk_model_id: city.id,
      //   logical_op: 'AND',
      //   is_group: true,
      //   children: [
      //     {
      //       fk_model_id: city.id,
      //       fk_column_id: (await city.getColumns())?.find(
      //         c => c.alias === 'Country <= City'
      //       )?.id,
      //       comparison_op: 'like',
      //       value: '%dia%'
      //     }
      //   ]
      // });

      let film = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'film'
      });
      let actor = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'actor'
      });
      const category = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'category'
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: film.id,
        ui_data_type: UITypes.Lookup,
        _cn: 'CategoryNames',
        fk_lookup_column_id: (await category.getColumns()).find(
          c => c.alias === 'Name'
        )?.id,
        fk_relation_column_id: (await film.getColumns()).find(
          c => c.alias === 'Film <=> Category'
        )?.id
      });
      film = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'film'
      });
      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: actor.id,
        ui_data_type: UITypes.Lookup,
        _cn: 'CategoryNames',
        fk_lookup_column_id: (await film.getColumns()).find(
          c => c.alias === 'CategoryNames'
        )?.id,
        fk_relation_column_id: (await actor.getColumns()).find(
          c => c.alias === 'Actor <=> Film'
        )?.id
      });
      actor = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'actor'
      });
      // film - filter
      await Filter.insert({
        fk_model_id: actor.id,
        logical_op: 'AND',
        is_group: true,
        children: [
          {
            fk_model_id: actor.id,
            fk_column_id: (await actor.getColumns())?.find(
              c => c.alias === 'CategoryNames'
            )?.id,
            comparison_op: 'eq',
            value: 'Travel'
          }
        ]
      });

      await Sort.insert({
        direction: 'desc',
        fk_model_id: country.id,
        fk_column_id: (await country.getColumns())?.find(
          c => c.alias === 'CityCount'
        )?.id
      });

      await Sort.insert({
        direction: 'desc',
        fk_model_id: city.id,
        fk_column_id: (await city.getColumns())?.find(
          c => c.alias === 'Country <= City'
        )?.id
      });

      address = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'address'
      });
      await Sort.insert({
        direction: 'desc',
        fk_model_id: address.id,
        fk_column_id: (await address.getColumns())?.find(
          c => c.alias === 'Country Name'
        )?.id
      });

      res.json({ msg: 'success' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });

  router.post('/generate', async (req: any, res) => {
    try {
      for (const body of Array.isArray(req.body) ? req.body : [req.body]) {
        if (!body?.type) throw new Error("Missing 'type' property");

        switch (body.type) {
          case UITypes.Lookup:
            {
              validateParams(
                ['table', 'lookupColumn', 'alias', 'relationColumn'],
                body
              );

              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });

              const relationColumn = (await model.getColumns()).find(
                c =>
                  (c.alias === body.relationColumn ||
                    c.title === body.relationColumn) &&
                  c.ui_data_type === UITypes.LinkToAnotherRecord
              );

              if (!relationColumn)
                throw new Error(
                  `Relation column named '${body.relationColumn}' is not found`
                );

              const relation = await relationColumn.getColOptions<
                LinkToAnotherRecordColumn
              >();
              const relatedModel = await (relation.type === 'hm'
                ? await relation.getChildColumn()
                : await relation.getParentColumn()
              ).getModel();

              const lookupColumn = (await relatedModel.getColumns()).find(
                c => c.alias === body.lookupColumn
              );

              await Column.insert<LookupColumn>({
                base_id: ctx.baseId,
                db_alias: 'db',
                _cn: body.alias,
                fk_model_id: model.id,
                ui_data_type: UITypes.Lookup,
                fk_lookup_column_id: lookupColumn?.id,
                fk_relation_column_id: relationColumn?.id
              });
            }
            break;
          case UITypes.Rollup:
            {
              validateParams(
                [
                  'table',
                  'rollupColumn',
                  'relationColumn',
                  'alias',
                  'rollupFunction'
                ],
                body
              );

              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });

              const relationColumn = (await model.getColumns()).find(
                c =>
                  (c.alias === body.relationColumn ||
                    c.title === body.relationColumn) &&
                  c.ui_data_type === UITypes.LinkToAnotherRecord
              );

              if (!relationColumn)
                throw new Error(
                  `Relation column named '${body.relationColumn}' is not found`
                );

              const relation = await relationColumn.getColOptions<
                LinkToAnotherRecordColumn
              >();

              if (relation.type === 'bt') throw new Error('');

              const relatedModel = await (relation.type === 'hm'
                ? await relation.getChildColumn()
                : await relation.getParentColumn()
              ).getModel();

              const rollupColumn = (await relatedModel.getColumns()).find(
                c => c.alias === body.rollupColumn
              );

              await Column.insert<RollupColumn>({
                base_id: ctx.baseId,
                db_alias: 'db',
                _cn: body.alias,
                fk_model_id: model.id,
                ui_data_type: UITypes.Rollup,
                fk_relation_column_id: relationColumn.id,
                fk_rollup_column_id: rollupColumn.id,

                rollup_function: body.rollupFunction
              });
            }
            break;
          case UITypes.Formula:
            {
              validateParams(['table', 'formula', 'alias'], body);
              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });
              const columns = await model.getColumns();
              const substituteId = async (pt: any) => {
                if (pt.type === 'CallExpression') {
                  for (const arg of pt.arguments || []) {
                    await substituteId(arg);
                  }
                } else if (pt.type === 'Literal') {
                  return;
                } else if (pt.type === 'Identifier') {
                  const colNameOrId = pt.name;
                  const column = columns.find(
                    c =>
                      c.id === colNameOrId ||
                      c.title === colNameOrId ||
                      c.alias === colNameOrId
                  );
                  pt.name = column.id;
                } else if (pt.type === 'BinaryExpression') {
                  await substituteId(pt.left);
                  await substituteId(pt.right);
                }
              };

              const parsedFormula = jsep(body.formula);
              await substituteId(parsedFormula);
              // console.log(parsedFormula);
              const formula = jsepTreeToFormula(parsedFormula);

              await Column.insert<FormulaColumn>({
                base_id: ctx.baseId,
                db_alias: 'db',
                _cn: body.alias,
                fk_model_id: model.id,
                ui_data_type: UITypes.Formula,
                formula
              });
            }

            break;

          case 'DeleteAllSort':
            {
              validateParams(['table'], body);
              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });
              if (!model) {
                throw new Error(`Table not found - ${body.table}`);
              }
              await Sort.deleteAll(model.id);
            }
            break;
          case 'Sort':
            {
              validateParams(['table', 'column', 'direction'], body);
              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });
              if (!model) {
                throw new Error(`Table not found - ${body.table}`);
              }

              const columns = await model.getColumns();

              const column = columns.find(
                c => c.alias === body.column || c.title === body.column
              );
              if (!model) {
                throw new Error(`Column not found - ${body.column}`);
              }

              await Sort.insert({
                direction: body.direction || 'asc',
                fk_model_id: model.id,
                fk_column_id: column?.id
              });
            }
            break;
          case 'DeleteAllFilter':
            {
              validateParams(['table'], body);
              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });
              if (!model) {
                throw new Error(`Table not found - ${body.table}`);
              }
              await Filter.deleteAll(model.id);
            }
            break;
          case 'Filter':
            {
              validateParams(['table', 'filter'], body);
              const model = await Model.get({
                base_id: ctx.baseId,
                db_alias: ctx.dbAlias,
                tn: body.table
              });
              if (!model) {
                throw new Error(`Table not found - ${body.table}`);
              }

              const columns = await model.getColumns();

              let filter = body.filter;
              if (!filter.logical_op) {
                filter = {
                  logical_op: 'OR',
                  is_group: true,
                  children: Array.isArray(filter) ? filter : [filter]
                };
              }

              const replaceWithId = async condition => {
                if (!condition) return;
                condition.fk_model_id = model.id;
                if (condition.logical_op) {
                  condition.is_group = true;
                  if (condition.children && !Array.isArray(condition.children))
                    throw Error('children property should be an array');
                  for (const con of condition.children || []) {
                    await replaceWithId(con);
                  }
                } else {
                  const column = columns.find(
                    c =>
                      c.title === condition.column ||
                      c.alias === condition.column
                  );
                  if (!column)
                    throw new Error(
                      `Column with following name is not found ${condition.column}`
                    );
                  condition.fk_column_id = column.id;
                  if (!('comparison_op' in condition)) {
                    throw new Error('comparison_op not found');
                  }
                  if (!('value' in condition)) {
                    throw new Error('value not found');
                  }
                }
              };
              await replaceWithId(filter);
              await Filter.insert(filter);
            }
            break;

          case 'DeleteAllMetas':
            {
              // validateParams([''], body);

              for (const model of await Model.list({
                project_id: ctx.baseId,
                db_alias: ctx.dbAlias
              })) {
                if (model?.id) {
                  await Filter.deleteAll(model.id);
                  await Sort.deleteAll(model.id);
                }
              }
              await Noco.ncMeta.metaDelete(null, null, 'nc_col_lookup_v2', {});
              await Noco.ncMeta.metaDelete(null, null, 'nc_col_rollup_v2', {});
              await Noco.ncMeta.metaDelete(null, null, 'nc_col_formula_v2', {});

              await Noco.ncMeta.metaDelete(null, null, 'nc_columns_v2', null, {
                _or: [
                  { ui_data_type: { eq: UITypes.Lookup } },
                  { ui_data_type: { eq: UITypes.Rollup } },
                  { ui_data_type: { eq: UITypes.Formula } }
                ]
              });
            }
            break;
          default:
            continue;
        }
      }

      res.json({ msg: 'success' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });
  // args.router.use('/api/v2/:model_id', router);

  ctx.router.use(router);
}

function validateParams(props: string[], body: any) {
  for (const prop of props) {
    if (!(prop in body))
      throw new Error(`Missing '${prop}' property in request body`);
  }
}
