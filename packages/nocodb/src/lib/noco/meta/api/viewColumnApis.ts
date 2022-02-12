import { Request, Response, Router } from 'express';
import View from '../../../noco-models/View';

export async function columnList(req: Request, res: Response, next) {
  try {
    res.json(await View.getColumns(req.params.viewId));
  } catch (e) {
    console.log(e);
    next(e);
  }
}
export async function columnAdd(_req: Request, res: Response, next) {
  try {
    res.json({});
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export async function columnUpdate(req: Request, res: Response, next) {
  try {
    res.json(
      await View.updateColumn(req.params.viewId, req.params.columnId, req.body)
    );
  } catch (e) {
    console.log(e);
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get('/', columnList);
router.get('/', columnAdd);
router.put('/:columnId', columnUpdate);
export default router;
