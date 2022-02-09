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
export async function filterGet(req: Request, res: Response<Table>) {

}

// @ts-ignore
export async function filterList(req: Request<any, any, any, TableListParams>, res: Response<TableList>) {

}

// @ts-ignore
export async function filterCreate(req: Request<any, any, TableReq>, res, next) {

}

// @ts-ignore
export async function filterUpdate(req, res) {

}

// @ts-ignore
export async function filterDelete(req: Request, res: Response, next) {

}

const router = Router({ mergeParams: true });
router.get('/', filterList);
router.post('/', filterCreate);
router.get('/:filterId', filterGet);
router.put('/:filterId', filterUpdate);
router.delete('/:filterId', filterDelete);
export default router;
