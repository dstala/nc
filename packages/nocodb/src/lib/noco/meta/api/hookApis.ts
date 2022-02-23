import catchError from './helpers/catchError';
import { Request, Response, Router } from 'express';
import Hook from '../../../noco-models/Hook';
import { HookListType, HookType } from 'nc-common';
import { PagedResponseImpl } from './helpers/PagedResponse';

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

const router = Router({ mergeParams: true });
router.get('/tables/:modelId/hooks', catchError(hookList));
router.post('/tables/:modelId/hooks', catchError(hookCreate));
router.delete('/hooks/:hookId', catchError(hookDelete));
router.put('/hooks/:hookId', catchError(hookUpdate));
export default router;
