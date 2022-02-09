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
export async function sortGet(req: Request, res: Response<Table>) {

}

// @ts-ignore
export async function sortList(req: Request<any, any, any, TableListParams>, res: Response<TableList>) {

}

// @ts-ignore
export async function sortCreate(req: Request<any, any, TableReq>, res, next) {

}

// @ts-ignore
export async function sortUpdate(req, res) {

}

// @ts-ignore
export async function sortDelete(req: Request, res: Response, next) {

}

const router = Router({ mergeParams: true });
router.get('/', sortList);
router.post('/', sortCreate);
router.get('/:sortId', sortGet);
router.put('/:sortId', sortUpdate);
router.delete('/:sortId', sortDelete);
export default router;
