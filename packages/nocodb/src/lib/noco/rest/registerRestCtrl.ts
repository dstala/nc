import { nocoExecute } from '../noco-resolver/NocoExecute';
import { Router } from 'express';
import Model from '../../noco-models/Model';
import { BaseModelSqlv2 } from '../../dataMapper/lib/sql/BaseModelSqlv2';

export default function registerRestCtrl(ctx: {
  router: Router;
  baseId: string;
  dbAlias: string;
  nocoRootResolvers: any;
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
          ctx.nocoRootResolvers,
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
          ctx.nocoRootResolvers,
          {},
          req.params.id
        )
      );
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: e.message });
    }
  });

  // args.router.use('/api/v2/:model_id', router);

  ctx.router.use(router);
}
