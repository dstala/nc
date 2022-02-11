import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
// @ts-ignore
import { Table, TableList, TableListParams, TableReq } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import Filter from '../../../noco-models/Filter';

// @ts-ignore
export async function filterGet(req: Request, res: Response, next) {
  try {
    const filter = await Filter.getFilterObject({ viewId: req.params.viewId });

    res.json(filter);
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function filterList(
  req: Request<any, any, any, TableListParams>,
  res: Response,
  next
) {
  try {
    const filter = await Filter.list({ viewId: req.params.viewId });

    res.json(filter);
  } catch (e) {
    next(e);
  }
}

export async function filterCreate(
  req: Request<any, any, TableReq>,
  res,
  next
) {
  try {
    const filter = await Filter.insert({
      ...req.body,
      fk_view_id: req.params.viewId
    });

    res.json(filter);
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function filterUpdate(req, res, next) {
  try {
    const filter = await Filter.update(req.params.filterId, {
      ...req.body,
      fk_view_id: req.params.viewId
    });
    res.json(filter);
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function filterDelete(req: Request, res: Response, next) {
  try {
    const filter = await Filter.delete(req.params.filterId);
    res.json(filter);
  } catch (e) {
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get('/', filterList);
router.post('/', filterCreate);
router.get('/:filterId', filterGet);
router.put('/:filterId', filterUpdate);
router.delete('/:filterId', filterDelete);
export default router;
