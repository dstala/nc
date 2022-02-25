import { Request, Response, Router } from 'express';
import catchError from './helpers/catchError';
import GridViewColumn from '../../../noco-models/GridViewColumn';
export async function columnList(req: Request, res: Response) {
  res.json(await GridViewColumn.list(req.params.gridId));
}
export async function columnUpdate(req: Request, res: Response) {
  res.json(await GridViewColumn.update(req.params.columnId, req.body));
}

const router = Router({ mergeParams: true });
router.get('/grid/:gridId/gridColumns', catchError(columnList));
router.put('/gridColumns/:columnId', catchError(columnUpdate));
export default router;
