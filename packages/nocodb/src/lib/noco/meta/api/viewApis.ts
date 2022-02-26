import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
// @ts-ignore
import { Table, TableReq, ViewList } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import catchError from './helpers/catchError';
import View from '../../../noco-models/View';

// @ts-ignore
export async function viewGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function viewList(
  req: Request<any, any, any>,
  res: Response<ViewList>
) {
  res.json({
    views: new PagedResponseImpl(await View.list(req.params.tableId))
  } as any);
}
// @ts-ignore
export async function shareView(
  req: Request<any, any, any>,
  res: Response<View>
) {
  res.json(await View.share(req.params.viewId));
}

// @ts-ignore
export async function viewCreate(req: Request<any, any>, res, next) {}

// @ts-ignore
export async function viewUpdate(req, res) {
  res.json(await View.update(req.params.viewId, req.body));
}

// @ts-ignore
export async function viewDelete(req: Request, res: Response, next) {
  res.json(await View.delete(req.params.viewId));
}

const router = Router({ mergeParams: true });
router.get('/tables/:tableId/views', catchError(viewList));
// router.post('/tables/:tableId/views', viewCreate);
// router.get('/views/:viewId', viewGet);
router.post('/views/:viewId/share', catchError(shareView));

async function shareViewPasswordUpdate(req: Request<any, any>, res) {
  res.json(await View.passwordUpdate(req.params.viewId, req.body));
}

async function shareViewDelete(req: Request<any, any>, res) {
  res.json(await View.sharedViewDelete(req.params.viewId));
}
async function showAllColumns(req: Request<any, any>, res) {
  res.json(await View.showAllColumns(req.params.viewId));
}
async function hideAllColumns(req: Request<any, any>, res) {
  res.json(await View.hideAllColumns(req.params.viewId));
}

router.put('/views/:viewId/share', catchError(shareViewPasswordUpdate));
router.delete('/views/:viewId/share', catchError(shareViewDelete));
router.put('/views/:viewId', catchError(viewUpdate));
router.delete('/views/:viewId', catchError(viewDelete));
router.post('/views/:viewId/showAll', catchError(hideAllColumns));
router.post('/views/:viewId/hideAll', catchError(showAllColumns));
export default router;
