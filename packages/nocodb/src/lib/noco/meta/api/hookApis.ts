import catchError from './helpers/catchError';
import { Request, Response, Router } from 'express';
import Hook from '../../../noco-models/Hook';
import { HookListType, HookTestPayloadType, HookType } from 'nc-common';
import { PagedResponseImpl } from './helpers/PagedResponse';
import { invokeWebhook } from './helpers/webhookHelpers';
import Model from '../../../noco-models/Model';

export async function hookList(
  req: Request<any, any, any>,
  res: Response<HookListType>
) {
  // todo: pagination
  res.json({
    hooks: new PagedResponseImpl(
      await Hook.list({ fk_model_id: req.params.modelId })
    )
  });
}

export async function hookCreate(
  req: Request<any, HookType>,
  res: Response<HookType>
) {
  const hook = await Hook.insert({
    ...req.body,
    fk_model_id: req.params.modelId
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
  const model = await Model.get({ id: req.params.modelId });

  const {
    hook,
    payload: { data, user }
  } = req.body;
  await invokeWebhook(hook, model, data, user);

  res.json({ msg: 'Success' });
}

const router = Router({ mergeParams: true });
router.get('/tables/:modelId/hooks', catchError(hookList));
router.post('/tables/:modelId/hooks/test', catchError(hookTest));
router.post('/tables/:modelId/hooks', catchError(hookCreate));
router.delete('/hooks/:hookId', catchError(hookDelete));
router.put('/hooks/:hookId', catchError(hookUpdate));
export default router;
