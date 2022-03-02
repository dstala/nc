import Model from '../../../noco-models/Model';
import ModelRoleVisibility from '../../../noco-models/ModelRoleVisibility';
import { Router } from 'express';
import ncMetaAclMw from './helpers/ncMetaAclMw';

async function xcVisibilityMetaSetAll(req, res) {
  for (const d of req.body) {
    for (const role of Object.keys(d.disabled)) {
      const dataInDb = await ModelRoleVisibility.get({
        role,
        fk_model_id: d.fk_model_id
      });
      if (dataInDb) {
        if (d.disabled[role]) {
          if (!dataInDb.disabled) {
            await ModelRoleVisibility.update(dataInDb.id, {
              disabled: d.disabled[role]
            });
          }
        } else {
          await dataInDb.delete();
        }
      } else if (d.disabled[role]) {
        await ModelRoleVisibility.insert({
          fk_model_id: d.fk_model_id,
          disabled: d.disabled[role],
          role
        });
      }
    }
  }

  res.json({ msg: 'success' });
}

// @ts-ignore
export async function xcVisibilityMetaGet(projectId, baseId, type = 'table') {
  const roles = ['owner', 'guest', 'creator', 'viewer', 'editor', 'commenter'];

  const defaultDisabled = roles.reduce((o, r) => ({ ...o, [r]: false }), {});

  const models = await Model.list({ project_id: projectId, base_id: baseId });

  const result = models.reduce((obj, model) => {
    obj[model.id] = {
      tn: model.tn,
      _tn: model._tn,
      order: model.order,
      fk_model_id: model.id,
      id: model.id,
      type: model.type,
      disabled: { ...defaultDisabled }
    };
    return obj;
  }, {});

  const disabledList = await ModelRoleVisibility.list(projectId);

  for (const d of disabledList) {
    result[d.fk_model_id].disabled[d.role] = !!d.disabled;
  }

  return Object.values(result)?.sort(
    (a: any, b: any) =>
      (a.order || 0) - (b.order || 0) ||
      (a?._tn || a?.tn)?.localeCompare(b?._tn || b?.tn)
  );
}

const router = Router({ mergeParams: true });
router.get(
  '/projects/:projectId/:baseId/modelVisibility',
  ncMetaAclMw(async (req, res) => {
    res.json(
      await xcVisibilityMetaGet(req.params.projectId, req.params.baseId)
    );
  }, 'modelVisibilityList')
);
router.post(
  '/projects/:projectId/:baseId/modelVisibility',
  ncMetaAclMw(xcVisibilityMetaSetAll, 'modelVisibilitySet')
);
export default router;
