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
export async function webhookGet(req: Request, res: Response<Table>) {

}

// @ts-ignore
export async function webhookList(req: Request<any, any, any, TableListParams>, res: Response<TableList>) {

}

// @ts-ignore
export async function webhookCreate(req: Request<any, any, TableReq>, res, next) {

}

// @ts-ignore
export async function webhookUpdate(req, res) {

}

// @ts-ignore
export async function webhookDelete(req: Request, res: Response, next) {

}

const router = Router({ mergeParams: true });
router.get('/', webhookList);
router.post('/', webhookCreate);
router.get('/:webhookId', webhookGet);
router.put('/:webhookId', webhookUpdate);
router.delete('/:webhookId', webhookDelete);
export default router;
