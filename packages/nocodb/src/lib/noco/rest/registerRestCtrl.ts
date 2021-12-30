import { nocoExecute } from '../noco-resolver/NocoExecute';
import { Router } from 'express';
import Model from '../../noco-models/Model';
import { BaseModelSqlv2 } from '../../dataMapper/lib/sql/BaseModelSqlv2';
import Column from '../../noco-models/Column';
import UITypes from '../../sqlUi/UITypes';
import LookupColumn from '../../noco-models/LookupColumn';

export default function registerRestCtrl(ctx: {
  router: Router;
  baseId: string;
  dbAlias: string;
  baseModels2: {
    [key: string]: BaseModelSqlv2;
  };
}) {
  const router = Router();

  router.get('/api/v2/:model_name', async (req: any, res) => {
    try {
      const model = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        id: req.params.model_id,
        tn: req.params.model_name
      });

      res.json(
        await nocoExecute(
          {
            [`${model.alias}List`]: await ctx.baseModels2[model.title]
              .defaultResolverReq
          },
          {
            [`${model.alias}List`]: async () => {
              return await ctx.baseModels2[model.title].list();
            }
          },
          {},
          1
        )
      );
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
      res.json(
        await nocoExecute(
          {
            [`${model.alias}Read`]: await ctx.baseModels2[model.title]
              .defaultResolverReq
          },
          {
            [`${model.alias}Read`]: async id => {
              return await ctx.baseModels2[model.title].readByPk(id);
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
      const country = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'country'
      });
      const city = await Model.get({
        base_id: ctx.baseId,
        db_alias: ctx.dbAlias,
        tn: 'city'
      });
      // const address = await Model.get({
      //   base_id: ctx.baseId,
      //   db_alias: ctx.dbAlias,
      //   tn: 'country'
      // });

      await Column.insert<LookupColumn>({
        base_id: ctx.baseId,
        db_alias: 'db',
        _cn: 'addressList',
        fk_model_id: country.id,
        uidt: UITypes.Lookup,
        fk_lookup_column_id: (await city.getColumns()).find(
          c => c.uidt === UITypes.LinkToAnotherRecord
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

      res.json({ mesg: 'success' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });

  // args.router.use('/api/v2/:model_id', router);

  ctx.router.use(router);
}
