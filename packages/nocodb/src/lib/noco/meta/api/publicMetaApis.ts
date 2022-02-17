import { Request, Response, Router } from 'express';
import catchError from './helpers/catchError';
import View from '../../../noco-models/View';
import Model from '../../../noco-models/Model';
import UITypes from '../../../sqlUi/UITypes';
import { LinkToAnotherRecord } from 'nc-common';
import Column from '../../../noco-models/Column';

export async function viewMetaGet(req: Request, res: Response, next) {
  const view: View & {
    relatedMetas?: { [ket: string]: Model };
  } = await View.getByUUID(req.params.uuid);

  if (!view) return next(new Error('Not found'));

  await view.getViewWithInfo();
  await view.getColumns();
  await view.getModelWithInfo();
  await view.model.getColumns();

  // todo: return only required props
  delete view['password'];

  // const columnsById = c;

  view.model.columns = view.columns
    .filter(c => c.show)
    .map(
      c =>
        new Column({ ...c, ...view.model.columnsById[c.fk_column_id] } as any)
    ) as any;

  const relatedMetas = {};

  // load related table metas
  for (const col of view.model.columns) {
    if (UITypes.LinkToAnotherRecord === col.uidt) {
      const colOpt = await col.getColOptions<LinkToAnotherRecord>();
      relatedMetas[colOpt.fk_related_model_id] = await Model.getWithInfo({
        id: colOpt.fk_related_model_id
      });
      if (colOpt.type === 'mm') {
        relatedMetas[colOpt.fk_mm_model_id] = await Model.getWithInfo({
          id: colOpt.fk_mm_model_id
        });
      }
    }
  }

  view.relatedMetas = relatedMetas;

  res.json(view);
}

const router = Router({ mergeParams: true });
router.get('/', catchError(viewMetaGet));
export default router;
