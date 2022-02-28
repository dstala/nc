import { Request, Response, Router } from 'express';
import GridViewColumn from '../../../noco-models/GridViewColumn';
import ncMetaAclMw from './helpers/ncMetaAclMw';
export async function columnList(req: Request, res: Response) {
  res.json(await GridViewColumn.list(req.params.gridViewId));
}
export async function columnUpdate(req: Request, res: Response) {
  res.json(await GridViewColumn.update(req.params.gridViewColumnId, req.body));
}

const router = Router({ mergeParams: true });
router.get('/grid/:gridViewId/gridColumns', ncMetaAclMw(columnList));
router.put('/gridColumns/:gridViewColumnId', ncMetaAclMw(columnUpdate));
export default router;
