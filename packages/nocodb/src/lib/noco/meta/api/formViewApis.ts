import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import { Form, ViewTypes } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import View from '../../../noco-models/View';
import catchError from './helpers/catchError';
import FormView from '../../../noco-models/FormView';

// @ts-ignore
export async function formViewGet(req: Request, res: Response<Form>) {
  res.json(await FormView.getWithInfo(req.params.formViewId));
}

export async function formViewCreate(req: Request<any, any>, res) {
  const view = await View.insert({
    ...req.body,
    fk_model_id: req.params.tableId,
    type: ViewTypes.FORM
  });
  res.json(view);
}
// @ts-ignore
export async function formViewUpdate(req, res) {
  res.json(await FormView.update(req.params.formViewId, req.body));
}

// @ts-ignore
export async function formViewDelete(req: Request, res: Response, next) {}

const router = Router({ mergeParams: true });
router.post('/tables/:tableId/forms', catchError(formViewCreate));
router.get('/forms/:formViewId', catchError(formViewGet));
router.put('/forms/:formViewId', catchError(formViewUpdate));
router.delete('/forms/:formViewId', catchError(formViewDelete));
export default router;
