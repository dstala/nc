import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from '../../noco-resolver/NocoExecute';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';

export async function dataList(req: Request, res: Response, next) {
  try {
    console.time('Model.get');
    const model = await Model.get({
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(model.db_alias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');

    console.time('BaseModel.defaultResolverReq');
    const key = `${model._tn}List`;
    const requestObj = {
      [key]: await baseModel.defaultResolverReq(req.query)
    };
    console.timeEnd('BaseModel.defaultResolverReq');

    console.time('nocoExecute');
    const data = (
      await nocoExecute(
        requestObj,
        {
          [key]: async args => {
            return await baseModel.list(args);
          }
        },
        {},
        req.query
      )
    )?.[key];
    console.timeEnd('nocoExecute');

    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataRead(req: Request, res: Response, next) {
  try {
    const model = await Model.get({
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(model.db_alias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });
    const key = `${model._tn}Read`;
    console.timeEnd('BaseModel.get');
    res.json(
      (
        await nocoExecute(
          {
            [key]: await baseModel.defaultResolverReq()
          },
          {
            [key]: async id => {
              return await baseModel.readByPk(id);
              // return row ? new ctx.types[model.title](row) : null;
            }
          },
          {},
          req.params.rowId
        )
      )?.[key]
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataInsert(req: Request, res: Response, next) {
  try {
    const model = await Model.get({
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(model.db_alias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');
    res.json(await baseModel.insert(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataUpdate(req: Request, res: Response, next) {
  try {
    const model = await Model.get({
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(model.db_alias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');
    res.json(await baseModel.updateByPk(req.params.rowId, req.body));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataDelete(req: Request, res: Response, next) {
  try {
    const model = await Model.get({
      id: req.params.modelId
    });
    if (!model) return next(new Error('Table not found'));

    console.timeEnd('Model.get');
    const base = await Base.get(model.db_alias);
    console.time('BaseModel.get');
    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    console.timeEnd('BaseModel.get');
    res.json(await baseModel.delByPk(req.params.rowId));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

const router = Router({ mergeParams: true });
router.get('/:modelId', dataList);
router.post('/:modelId', dataInsert);
router.get('/:modelId/:rowId', dataRead);
router.put('/:modelId/:rowId', dataUpdate);
router.delete('/:modelId/:rowId', dataDelete);
export default router;
