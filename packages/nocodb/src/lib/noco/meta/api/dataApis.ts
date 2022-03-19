import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from 'nc-help';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { PagedResponseImpl } from './helpers/PagedResponse';
import View from '../../../noco-models/View';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function dataList(req: Request, res: Response, next) {
  try {
    const view = await View.get(req.params.viewId);

    const model = await Model.getByIdOrName({
      id: view?.fk_model_id || req.params.viewId
    });

    if (!model) return next(new Error('Table not found'));

    const base = await Base.get(model.base_id);

    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      viewId: view?.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    const key = `${model._tn}List`;
    const requestObj = {
      [key]: await baseModel.defaultResolverReq(req.query)
    };

    const listArgs: any = { ...req.query };
    try {
      listArgs.filterArr = JSON.parse(listArgs.filterArrJson);
    } catch (e) {}
    try {
      listArgs.sortArr = JSON.parse(listArgs.sortArrJson);
    } catch (e) {}

    const data = (
      await nocoExecute(
        requestObj,
        {
          [key]: async args => {
            return await baseModel.list(args);
          }
        },
        {},
        listArgs
      )
    )?.[key];

    const count = await baseModel.count(listArgs);

    res.json({
      data: new PagedResponseImpl(data, {
        // todo:
        totalRows: count,
        pageSize: 25,
        page: 1
      })
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

export async function mmList(req: Request, res: Response, next) {
  const view = await View.get(req.params.viewId);

  const model = await Model.getByIdOrName({
    id: view?.fk_model_id || req.params.viewId
  });

  if (!model) return next(new Error('Table not found'));

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `${model._tn}List`;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async _args => {
          return (
            await baseModel.mmList({
              colId: req.params.colId,
              parentIds: [req.params.rowId]
            })
          )?.[0];
        }
      },
      {},
      req.query
    )
  )?.[key];

  const count = (
    await baseModel.mmListCount({
      colId: req.params.colId,
      parentIds: [req.params.rowId]
    })
  )?.[0]?.count;

  res.json({
    data: new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  });
}

export async function hmList(req: Request, res: Response, next) {
  const view = await View.get(req.params.viewId);

  const model = await Model.getByIdOrName({
    id: view?.fk_model_id || req.params.viewId
  });

  if (!model) return next(new Error('Table not found'));

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `${model._tn}List`;
  const requestObj: any = {
    [key]: 1
  };

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async _args => {
          return (
            await baseModel.hmList({
              colId: req.params.colId,
              ids: [req.params.rowId]
            })
          )?.[0];
        }
      },
      {},
      req.query
    )
  )?.[key];

  const count = (
    await baseModel.hmListCount({
      colId: req.params.colId,
      ids: [req.params.rowId]
    })
  )?.[0]?.count;

  res.json({
    data: new PagedResponseImpl(data, {
      // todo:
      totalRows: count,
      pageSize: 25,
      page: 1
    })
  });
}

async function dataRead(req: Request, res: Response, next) {
  try {
    const model = await Model.getByIdOrName({
      id: req.params.viewId
    });
    if (!model) return next(new Error('Table not found'));

    const base = await Base.get(model.base_id);

    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });
    const key = `${model._tn}Read`;

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
    const model = await Model.getByIdOrName({
      id: req.params.viewId
    });
    if (!model) return next(new Error('Table not found'));

    const base = await Base.get(model.base_id);

    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    res.json(await baseModel.insert(req.body, null, req));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataUpdate(req: Request, res: Response, next) {
  try {
    const model = await Model.getByIdOrName({
      id: req.params.viewId
    });
    if (!model) return next(new Error('Table not found'));

    const base = await Base.get(model.base_id);

    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    res.json(await baseModel.updateByPk(req.params.rowId, req.body, null, req));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

async function dataDelete(req: Request, res: Response, next) {
  try {
    const model = await Model.getByIdOrName({
      id: req.params.viewId
    });
    if (!model) return next(new Error('Table not found'));

    const base = await Base.get(model.base_id);

    const baseModel = await Model.getBaseModelSQL({
      id: model.id,
      dbDriver: NcConnectionMgrv2.get(base)
    });

    res.json(await baseModel.delByPk(req.params.rowId, null, req));
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e.message });
  }
}

const router = Router({ mergeParams: true });
router.get('/data/:viewId/', ncMetaAclMw(dataList));
router.post('/data/:viewId/', ncMetaAclMw(dataInsert));
router.get('/data/:viewId/:rowId', ncMetaAclMw(dataRead));
router.put('/data/:viewId/:rowId', ncMetaAclMw(dataUpdate));
router.delete('/data/:viewId/:rowId', ncMetaAclMw(dataDelete));
router.get('/data/:viewId/:rowId/mm/:colId', ncMetaAclMw(mmList));
// todo: implement these apis
// router.get('/data/:viewId/:rowId/mm/:colId/exclude', ncMetaAclMw(mmList));
router.get('/data/:viewId/:rowId/hm/:colId', ncMetaAclMw(hmList));
// router.get('/data/:viewId/:rowId/hm/:colId/exclude', ncMetaAclMw(mmList));
export default router;
