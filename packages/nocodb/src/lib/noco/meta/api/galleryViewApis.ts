import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import { Table, TableList, TableListParams, ViewTypes } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import catchError from './helpers/catchError';
import View from '../../../noco-models/View';

// @ts-ignore
export async function galleyViewGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function galleyViewList(
  _req: Request<any, any, any, TableListParams>,
  _res: Response<TableList>
) {}

// @ts-ignore
export async function galleryViewCreate(req: Request<any, any>, res) {
  const view = await View.insert({
    ...req.body,
    fk_model_id: req.params.tableId,
    type: ViewTypes.GALLERY
  });
  res.json(view);
}

// @ts-ignore
export async function galleyViewUpdate(req, res) {}

// @ts-ignore
export async function galleyViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
// router.get('/', galleyViewList);
router.post('/', catchError(galleryViewCreate));
// router.get('/:galleyViewId', galleyViewGet);
// router.put('/:galleyViewId', galleyViewUpdate);
// router.delete('/:galleyViewId', galleyViewDelete);
export default router;
