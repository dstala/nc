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
export async function gridViewGet(req: Request, res: Response<Table>) {

}

// @ts-ignore
export async function gridViewList(req: Request<any, any, any, TableListParams>, res: Response<TableList>) {

}

// @ts-ignore
export async function gridViewCreate(req: Request<any, any, TableReq>, res, next) {

}

// @ts-ignore
export async function gridViewUpdate(req, res) {

}

// @ts-ignore
export async function gridViewDelete(req: Request, res: Response, next) {

}

const router = Router({ mergeParams: true });
router.get('/', gridViewList);
router.post('/', gridViewCreate);
router.get('/:gridViewId', gridViewGet);
router.put('/:gridViewId', gridViewUpdate);
router.delete('/:gridViewId', gridViewDelete);
export default router;
