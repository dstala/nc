import catchError from './helpers/catchError';
import { Request, Router } from 'express';
import Audit from '../../../noco-models/Audit';
import {
  AuditOperationTypes,
  CommentCountParamsType,
  CommentListParamsType,
  CommentRowPayloadType
} from 'nc-common';

export async function commentRow(
  req: Request<any, any, CommentRowPayloadType>,
  res
) {
  res.json(
    await Audit.insert({
      ...req.body,
      op_type: AuditOperationTypes.COMMENT
    })
  );
}
export async function commentList(
  req: Request<any, any, any, CommentListParamsType>,
  res
) {
  res.json(await Audit.commentsList(req.query));
}
export async function commentsCount(
  req: Request<any, any, any, CommentCountParamsType>,
  res
) {
  res.json(
    await Audit.commentsCount({
      fk_model_id: req.query.fk_model_id as string,
      ids: req.query.ids as string[]
    })
  );
}

const router = Router({ mergeParams: true });
router.get('/audits/comments', catchError(commentList));
router.post('/audits/comments', catchError(commentRow));
router.get('/audits/comments/count', catchError(commentsCount));
export default router;
