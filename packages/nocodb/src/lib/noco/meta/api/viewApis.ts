import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
// @ts-ignore
import { Table, TableList, TableListParams, TableReq } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';

// @ts-ignore
export async function viewGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function viewList(
  _req: Request<any, any, any, TableListParams>,
  _res: Response<TableList>
) {}

// @ts-ignore
export async function viewCreate(req: Request<any, any, TableReq>, res, next) {}

// @ts-ignore
export async function viewUpdate(req, res) {}

// @ts-ignore
export async function viewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.get('/', viewList);
router.post('/', viewCreate);
router.get('/:viewId', viewGet);
router.put('/:viewId', viewUpdate);
router.delete('/:viewId', viewDelete);
export default router;
