import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import {
  Table,
  TableList,
  TableListParams,
  TableReq
} from '../../../noco-client/Api';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';

// @ts-ignore
export async function galleryViewGet(req: Request, res: Response<Table>) {

}

// @ts-ignore
export async function galleryViewList(req: Request<any, any, any, TableListParams>, res: Response<TableList>) {

}

// @ts-ignore
export async function galleryViewCreate(req: Request<any, any, TableReq>, res, next) {

}

// @ts-ignore
export async function galleryViewUpdate(req, res) {

}

// @ts-ignore
export async function galleryViewDelete(req: Request, res: Response, next) {

}

const router = Router({ mergeParams: true });
router.get('/', galleryViewList);
router.post('/', galleryViewCreate);
router.get('/:galleryViewId', galleryViewGet);
router.put('/:galleryViewId', galleryViewUpdate);
router.delete('/:galleryViewId', galleryViewDelete);
export default router;
