import { Request, Response, Router } from 'express';
import FormViewColumn from '../../../noco-models/FormViewColumn';
import ncMetaAclMw from './helpers/ncMetaAclMw';

export async function columnUpdate(req: Request, res: Response) {
  res.json(await FormViewColumn.update(req.params.formViewColumnId, req.body));
}

const router = Router({ mergeParams: true });
router.put('/:formViewColumnId', ncMetaAclMw(columnUpdate));
export default router;
