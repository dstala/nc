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
export async function viewCreate(req: Request<any, any, TableReq>, res, next) {}

// @ts-ignore
export async function viewUpdate(req, res) {}

// @ts-ignore
export async function viewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.get('/tables/:tableId/views', catchError(viewList));
// router.post('/tables/:tableId/views', viewCreate);
// router.get('/views/:viewId', viewGet);
// router.put('/views/:viewId', viewUpdate);
// router.delete('/views/:viewId', viewDelete);
export default router;
