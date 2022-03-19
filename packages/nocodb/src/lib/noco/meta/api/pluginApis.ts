import { Request, Response, Router } from 'express';
import { PagedResponseImpl } from './helpers/PagedResponse';
import Plugin from '../../../noco-models/Plugin';
import { PluginTestPayloadType, PluginType } from 'nc-common';
import NcPluginMgrv2 from './helpers/NcPluginMgrv2';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function pluginList(_req: Request, res: Response) {
  res.json({
    plugins: new PagedResponseImpl(await Plugin.list(), {
      totalRows: await Plugin.count()
    })
  });
}

export async function pluginTest(
  req: Request<any, any, PluginTestPayloadType>,
  res: Response
) {
  res.json(await NcPluginMgrv2.test(req.body));
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
export async function isPluginActive(req: Request, res: Response) {
  res.json(await Plugin.isPluginActive(req.params.pluginTitle));
}

const router = Router({ mergeParams: true });
router.get('/plugins', ncMetaAclMw(pluginList));
router.post('/plugins/test', ncMetaAclMw(pluginTest));
router.get('/plugins/:pluginId', ncMetaAclMw(pluginRead));
router.put('/plugins/:pluginId', ncMetaAclMw(pluginUpdate));
router.get('/plugins/:pluginTitle/status', ncMetaAclMw(isPluginActive));
export default router;
