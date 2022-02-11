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

// @ts-ignore
export async function formViewGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function formViewList(
  _req: Request<any, any, any, TableListParams>,
  _res: Response<TableList>
) {}

// @ts-ignore
export async function formViewCreate(
  _req: Request<any, any, TableReq>,
  _res,
  _next
) {}

// @ts-ignore
export async function formViewUpdate(req, res) {}

// @ts-ignore
export async function formViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.get('/', formViewList);
router.post('/', formViewCreate);
router.get('/:formViewId', formViewGet);
router.put('/:formViewId', formViewUpdate);
router.delete('/:formViewId', formViewDelete);
export default router;
