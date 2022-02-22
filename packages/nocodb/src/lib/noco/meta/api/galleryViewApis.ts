import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import {
  GalleryType,
  TableListParamsType,
  TableListType,
  ViewTypes
} from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import catchError from './helpers/catchError';
import View from '../../../noco-models/View';
import GalleryView from '../../../noco-models/GalleryView';

// @ts-ignore
export async function galleryViewGet(req: Request, res: Response<GalleryType>) {
  res.json(await GalleryView.get(req.params.galleyViewId));
}

// @ts-ignore
export async function galleyViewList(
  _req: Request<any, any, any, TableListParamsType>,
  _res: Response<TableListType>
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
export async function galleryViewUpdate(req, res) {
  res.json(await GalleryView.update(req.params.galleyViewId, req.body));
}

// @ts-ignore
export async function galleyViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
// router.get('/', galleyViewList);
router.post('/tables/:tableId/galleries', catchError(galleryViewCreate));
// router.get('/:galleyViewId', galleyViewGet);
router.put('/galleries/:galleyViewId', catchError(galleryViewUpdate));
router.get('/galleries/:galleyViewId', catchError(galleryViewGet));
// router.delete('/:galleyViewId', galleyViewDelete);
export default router;
