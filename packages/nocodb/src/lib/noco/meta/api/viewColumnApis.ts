import { Request, Response, Router } from 'express';
import View from '../../../noco-models/View';
import catchError from './helpers/catchError';

export async function columnList(req: Request, res: Response) {
  res.json(await View.getColumns(req.params.viewId));
}
export async function columnAdd(req: Request, res: Response) {
  const viewColumn = await View.insertColumn({
    ...req.body,
    view_id: req.params.viewId
  });

  res.json(viewColumn);
}

export async function columnUpdate(req: Request, res: Response) {
  res.json(
    await View.updateColumn(req.params.viewId, req.params.columnId, req.body)
  );
}

const router = Router({ mergeParams: true });
router.get('/', catchError(columnList));
router.post('/', catchError(columnAdd));
router.put('/:columnId', catchError(columnUpdate));
export default router;
