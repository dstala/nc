import catchError from './helpers/catchError';
import { Request, Response, Router } from 'express';
import Hook from '../../../noco-models/Hook';
import { HookListType, HookTestPayloadType, HookType } from 'nc-common';
import { PagedResponseImpl } from './helpers/PagedResponse';
import { invokeWebhook } from './helpers/webhookHelpers';
import Model from '../../../noco-models/Model';
import populateSamplePayload from './helpers/populateSamplePayload';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function hookList(
  req: Request<any, any, any>,
  res: Response<HookListType>
) {
  // todo: pagination
  res.json({
    hooks: new PagedResponseImpl(
      await Hook.list({ fk_model_id: req.params.tableId })
    )
  });
}

export async function hookCreate(
  req: Request<any, HookType>,
  res: Response<HookType>
) {
  const hook = await Hook.insert({
    ...req.body,
    fk_model_id: req.params.tableId
  });
  res.json(hook);
}

export async function hookDelete(
  req: Request<any, HookType>,
  res: Response<any>
) {
  res.json(await Hook.delete(req.params.hookId));
}

export async function hookUpdate(
  req: Request<any, HookType>,
  res: Response<HookType>
) {
  res.json(await Hook.update(req.params.hookId, req.body));
}

export async function hookTest(
  req: Request<any, any, HookTestPayloadType>,
  res: Response
) {
  const model = await Model.getByIdOrName({ id: req.params.tableId });

  const {
    hook,
    payload: { data, user }
  } = req.body;
  await invokeWebhook(hook, model, data, user);

  res.json({ msg: 'Success' });
}
export async function tableSampleData(req: Request, res: Response) {
  const model = await Model.getByIdOrName({ id: req.params.tableId });

  res // todo: pagination
    .json(await populateSamplePayload(model, true, req.params.operation));
}

const router = Router({ mergeParams: true });
router.get('/tables/:tableId/hooks', ncMetaAclMw(hookList));
router.post('/tables/:tableId/hooks/test', ncMetaAclMw(hookTest));
router.post('/tables/:tableId/hooks', ncMetaAclMw(hookCreate));
router.delete('/hooks/:hookId', ncMetaAclMw(hookDelete));
router.put('/hooks/:hookId', ncMetaAclMw(hookUpdate));
router.get(
  '/tables/:tableId/hooks/samplePayload/:operation',
  catchError(tableSampleData)
);
export default router;
