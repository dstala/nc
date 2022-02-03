import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from '../../noco-resolver/NocoExecute';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';

export async function dataList(req: Request, res: Response, next) {
  try {
    console.time('Model.get');
    const model = await Model.get({
      base_id: req.params.projectId,
      db_alias: req.params.baseId,
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(req.params.dbAlias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');

    console.time('BaseModel.defaultResolverReq');
    const requestObj = {
      [`${model._tn}List`]: await baseModel.defaultResolverReq(req.query)
    };
    console.timeEnd('BaseModel.defaultResolverReq');

    console.time('nocoExecute');
    const data = await nocoExecute(
      requestObj,
      {
        [`${model._tn}List`]: async args => {
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
}

const router = Router({ mergeParams: true });
router.get('/:modelId', dataList);
export default router;
