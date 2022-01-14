import { nocoExecute } from '../noco-resolver/NocoExecute';
import { Router } from 'express';
import Model from '../../noco-models/Model';
import Column from '../../noco-models/Column';
import UITypes from '../../sqlUi/UITypes';
import LookupColumn from '../../noco-models/LookupColumn';
import RollupColumn from '../../noco-models/RollupColumn';
import Filter from '../../noco-models/Filter';

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
        [`${model.alias}List`]: await baseModel.defaultResolverReq
      };
      console.timeEnd('BaseModel.defaultResolverReq');

      console.time('nocoExecute');
      const data = await nocoExecute(
        requestObj,
        {
          [`${model.alias}List`]: async args => {
            console.log(
              JSON.stringify(
                await Filter.getFilterObject({ modelId: model.id }),
                null,
                2
              )
            );

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
            [`${model.alias}Read`]: await baseModel.defaultResolverReq
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
        uidt: UITypes.Lookup,
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c._cn === 'City => Address'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c.uidt === UITypes.LinkToAnotherRecord
        )?.id
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        _cn: 'CityNames',
        fk_model_id: country.id,
        uidt: UITypes.Lookup,
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c.cn === 'city'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c.uidt === UITypes.LinkToAnotherRecord
        )?.id
      });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: city.id,
        uidt: UITypes.Lookup,
        _cn: 'Country Name',
        fk_lookup_column_id: (await country.getColumns()).find(
          c => c._cn === 'Country'
        )?.id,
        fk_relation_column_id: (await city.getColumns()).find(
          c => c._cn === 'Country <= City'
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

      // Rollup
      await Column.insert<RollupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        fk_model_id: country.id,
        uidt: UITypes.Rollup,
        _cn: 'CityCount',
        fk_rollup_column_id: (await city.getColumns()).find(
          c => c._cn === 'CityId'
        )?.id,
        fk_relation_column_id: (await country.getColumns()).find(
          c => c._cn === 'Country => City'
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
              c => c._cn === 'CityCount'
            )?.id,
            comparison_op: 'eq',
            value: '1'
          }
          // {
          //   fk_model_id: country.id,
          //   fk_column_id: (await country.getColumns())?.find(
          //     c => c._cn === 'addressList'
          //   )?.id,
          //   comparison_op: 'like',
          //   value: '%1836%'
          // }
          // {
          //   fk_model_id: country.id,
          //   fk_column_id: (await country.getColumns())?.find(
          //     c => c._cn === 'Country => City'
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
          //         c => c.cn === 'country'
          //       )?.id,
          //       comparison_op: 'like',
          //       value: 'z%'
          //     },
          //     {
          //       fk_model_id: country.id,
          //       fk_column_id: (await country.getColumns())?.find(
          //         c => c.cn === 'country'
          //       )?.id,
          //       comparison_op: 'like',
          //       value: '%a'
          //     }
          //   ]
          // }
        ]
      });

      // city - filter
      await Filter.insert({
        fk_model_id: city.id,
        logical_op: 'AND',
        is_group: true,
        children: [
          {
            fk_model_id: city.id,
            fk_column_id: (await city.getColumns())?.find(
              c => c._cn === 'Country <= City'
            )?.id,
            comparison_op: 'like',
            value: '%dia%'
          }
        ]
      });

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
        uidt: UITypes.Lookup,
        _cn: 'CategoryNames',
        fk_lookup_column_id: (await category.getColumns()).find(
          c => c._cn === 'Name'
        )?.id,
        fk_relation_column_id: (await film.getColumns()).find(
          c => c._cn === 'Film <=> Category'
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
        uidt: UITypes.Lookup,
        _cn: 'CategoryNames',
        fk_lookup_column_id: (await film.getColumns()).find(
          c => c._cn === 'CategoryNames'
        )?.id,
        fk_relation_column_id: (await actor.getColumns()).find(
          c => c._cn === 'Actor <=> Film'
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
              c => c._cn === 'CategoryNames'
            )?.id,
            comparison_op: 'eq',
            value: 'Travel'
          }
        ]
      });

      res.json({ msg: 'success' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });

  // args.router.use('/api/v2/:model_id', router);

  ctx.router.use(router);
}
