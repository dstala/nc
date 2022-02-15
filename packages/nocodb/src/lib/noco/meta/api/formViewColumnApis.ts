import { Request, Response, Router } from 'express';
import catchError from './helpers/catchError';
import FormViewColumn from '../../../noco-models/FormViewColumn';

export async function columnUpdate(req: Request, res: Response) {
  res.json(await FormViewColumn.update(req.params.columnId, req.body));
}

const router = Router({ mergeParams: true });
router.put('/:columnId', catchError(columnUpdate));
export default router;
