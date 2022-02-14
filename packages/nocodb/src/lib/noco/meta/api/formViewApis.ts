import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import { Table, TableList, TableListParams, ViewTypes } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import View from '../../../noco-models/View';
import catchError from './helpers/catchError';

// @ts-ignore
export async function formViewGet(req: Request, res: Response<Table>) {}

// @ts-ignore
export async function formViewList(
  _req: Request<any, any, any, TableListParams>,
  _res: Response<TableList>
) {}

export async function formViewCreate(req: Request<any, any>, res) {
  const view = await View.insert({
    ...req.body,
    fk_model_id: req.params.tableId,
    type: ViewTypes.FORM
  });
  res.json(view);
}
// @ts-ignore
export async function formViewUpdate(req, res) {}

// @ts-ignore
export async function formViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.get('/', catchError(formViewList));
router.post('/', catchError(formViewCreate));
router.get('/:formViewId', catchError(formViewGet));
router.put('/:formViewId', catchError(formViewUpdate));
router.delete('/:formViewId', catchError(formViewDelete));
export default router;
