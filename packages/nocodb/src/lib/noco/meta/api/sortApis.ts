import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import {
  SortListType,
  TableListParamsType,
  TableReqType,
  TableType
} from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import Sort from '../../../noco-models/Sort';

// @ts-ignore
export async function sortGet(req: Request, res: Response<TableType>) {}

// @ts-ignore
export async function sortList(
  req: Request<any, any, any, TableListParamsType>,
  res: Response<SortListType>,
  next
) {
  try {
    const sortList = await Sort.list({ viewId: req.params.viewId });
    res.json({
      sorts: new PagedResponseImpl(sortList)
    });
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function sortCreate(
  req: Request<any, any, TableReqType>,
  res,
  next
) {
  try {
    const sort = await Sort.insert({
      ...req.body,
      fk_view_id: req.params.viewId
    });
    res.json(sort);
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function sortUpdate(req, res, next) {
  try {
    const sort = await Sort.update(req.params.sortId, req.body);
    res.json(sort);
  } catch (e) {
    next(e);
  }
}

// @ts-ignore
export async function sortDelete(req: Request, res: Response, next) {
  try {
    const sort = await Sort.delete(req.params.sortId);
    res.json(sort);
  } catch (e) {
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get('/', sortList);
router.post('/', sortCreate);
router.get('/:sortId', sortGet);
router.put('/:sortId', sortUpdate);
router.delete('/:sortId', sortDelete);
export default router;
