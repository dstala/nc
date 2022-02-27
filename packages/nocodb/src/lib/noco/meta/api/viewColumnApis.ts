import { Request, Response, Router } from 'express';
import View from '../../../noco-models/View';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function columnList(req: Request, res: Response) {
  res.json(await View.getColumns(req.params.viewId));
}
export async function columnAdd(req: Request, res: Response) {
  const viewColumn = await View.insertOrUpdateColumn(
    req.params.viewId,
    req.body.fk_column_id,
    {
      ...req.body,
      view_id: req.params.viewId
    }
  );

  res.json(viewColumn);
}

export async function columnUpdate(req: Request, res: Response) {
  res.json(
    await View.updateColumn(req.params.viewId, req.params.columnId, req.body)
  );
}

const router = Router({ mergeParams: true });
router.get('/views/:viewId/columns/', ncMetaAclMw(columnList));
router.post('/views/:viewId/columns/', ncMetaAclMw(columnAdd));
router.put('/views/:viewId/columns/:columnId', ncMetaAclMw(columnUpdate));
export default router;
