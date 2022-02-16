import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import { Table, TableList, TableListParams, TableReq } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import catchError from './helpers/catchError';

// @ts-ignore
export async function webhookGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function webhookList(
  _req: Request<any, any, any, TableListParams>,
  _res: Response<TableList>
) {}

// @ts-ignore
export async function webhookCreate(
  _req: Request<any, any, TableReq>,
  _res,
  _next
) {}

// @ts-ignore
export async function webhookUpdate(req, res) {}

// @ts-ignore
export async function webhookDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.get('/tables/:tableId/webhooks', catchError(webhookList));
router.post('/tables/:tableId/webhooks', webhookCreate);
router.get('/webhooks/:webhookId', webhookGet);
router.put('/webhooks/:webhookId', webhookUpdate);
router.delete('/webhooks/:webhookId', webhookDelete);
export default router;
