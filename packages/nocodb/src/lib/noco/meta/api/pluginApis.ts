import catchError from './helpers/catchError';
import { Request, Response, Router } from 'express';
import { PagedResponseImpl } from './helpers/PagedResponse';
import Plugin from '../../../noco-models/Plugin';
import { PluginType } from 'nc-common';

export async function pluginList(_req: Request, res: Response) {
  res.json({
    plugins: new PagedResponseImpl(await Plugin.list(), {
      totalRows: await Plugin.count()
    })
  });
}
export async function pluginRead(req: Request, res: Response) {
  res.json(await Plugin.get(req.params.pluginId));
}
export async function pluginUpdate(
  req: Request<any, any, PluginType>,
  res: Response
) {
  res.json(await Plugin.update(req.params.pluginId, req.body));
}

const router = Router({ mergeParams: true });
router.get('/plugins', catchError(pluginList));
router.get('/plugins/:pluginId', catchError(pluginRead));
router.put('/plugins/:pluginId', catchError(pluginUpdate));
export default router;
