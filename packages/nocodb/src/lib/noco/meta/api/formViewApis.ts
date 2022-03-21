import { Request, Response, Router } from 'express';
// @ts-ignore
import Model from '../../../noco-models/Model';
// @ts-ignore
import { PagedResponseImpl } from './helpers/PagedResponse';
import { FormType, ViewTypes } from 'nc-common';
// @ts-ignore
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
// @ts-ignore
import Project from '../../../noco-models/Project';
import View from '../../../noco-models/View';
import FormView from '../../../noco-models/FormView';
import ncMetaAclMw from './helpers/ncMetaAclMw';

// @ts-ignore
export async function formViewGet(req: Request, res: Response<FormType>) {
  const formViewData = await FormView.getWithInfo(req.params.formViewId);
  res.json(formViewData);
}

export async function formViewCreate(req: Request<any, any>, res) {
  const view = await View.insert({
    ...req.body,
    // todo: sanitize
    slug: req.body.title,
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
router.post('/tables/:tableId/forms', ncMetaAclMw(formViewCreate));
router.get('/forms/:formViewId', ncMetaAclMw(formViewGet));
router.put('/forms/:formViewId', ncMetaAclMw(formViewUpdate));
router.delete('/forms/:formViewId', ncMetaAclMw(formViewDelete));
export default router;
