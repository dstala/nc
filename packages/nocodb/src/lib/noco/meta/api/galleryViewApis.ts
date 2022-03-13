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
import View from '../../../noco-models/View';
import GalleryView from '../../../noco-models/GalleryView';
import ncMetaAclMw from './helpers/ncMetaAclMw';

// @ts-ignore
export async function galleryViewGet(req: Request, res: Response<GalleryType>) {
  res.json(await GalleryView.get(req.params.galleryViewId));
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
  res.json(await GalleryView.update(req.params.galleryViewId, req.body));
}

// @ts-ignore
export async function galleyViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
// router.get('/', galleyViewList);
router.post('/tables/:tableId/galleries', ncMetaAclMw(galleryViewCreate));
// router.get('/:galleryViewId', galleyViewGet);
router.put('/galleries/:galleryViewId', ncMetaAclMw(galleryViewUpdate));
router.get('/galleries/:galleryViewId', ncMetaAclMw(galleryViewGet));
// router.delete('/:galleryViewId', galleyViewDelete);
export default router;
