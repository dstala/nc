import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { nocoExecute } from 'nc-help';
import Base from '../../../noco-models/Base';
import NcConnectionMgrv2 from '../../common/NcConnectionMgrv2';
import { PagedResponseImpl } from './helpers/PagedResponse';
import View from '../../../noco-models/View';
import ncMetaAclMw from './helpers/ncMetaAclMw';
import Project from '../../../noco-models/Project';
import { NcError } from './helpers/catchError';

export async function dataListNew(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequest(req);
  res.json(await getDataList(model, view, req));
}

async function dataInsertNew(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequest(req);

  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.insert(req.body, null, req));
}

async function dataUpdateNew(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequest(req);
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.updateByPk(req.params.rowId, req.body, null, req));
}

async function dataDeleteNew(req: Request, res: Response) {
  const { model, view } = await getViewAndModelFromRequest(req);
  const base = await Base.get(model.base_id);
  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  res.json(await baseModel.delByPk(req.params.rowId, null, req));
}
async function getDataList(model, view: View, req) {
  const base = await Base.get(model.base_id);

  const baseModel = await Model.getBaseModelSQL({
    id: model.id,
    viewId: view?.id,
    dbDriver: NcConnectionMgrv2.get(base)
  });

  const key = `${model._tn}List`;
  const requestObj = {
    [key]: await baseModel.defaultResolverReq(req.query)
  };

  const listArgs: any = { ...req.query };
  try {
    listArgs.filterArr = JSON.parse(listArgs.filterArrJson);
  } catch (e) {}
  try {
    listArgs.sortArr = JSON.parse(listArgs.sortArrJson);
  } catch (e) {}

  const data = (
    await nocoExecute(
      requestObj,
      {
        [key]: async args => {
          return await baseModel.list(args);
        }
      },
      {},
      listArgs
    )
  )?.[key];

  const count = await baseModel.count(listArgs);

  return new PagedResponseImpl(data, {
    // todo:
    totalRows: count,
    pageSize: 25,
    page: 1
  });
}
async function getViewAndModelFromRequest(req) {
  const project = await Project.getWithInfoByTitle(req.params.projectName);
  const model = await Model.getByAliasOrId({
    project_id: project.id,
    base_id: project.bases?.[0]?.id,
    aliasOrId: req.params.tableName
  });
  const view =
    req.params.viewName &&
    (await View.getByTitleOrId({
      titleOrId: req.params.viewName,
      fk_model_id: model.id
    }));
  if (!model) NcError.notFound('Table not found');
  return { model, view };
}

const router = Router({ mergeParams: true });

router.get('/data/:orgs/:projectName/:tableName', ncMetaAclMw(dataListNew));
router.get(
  '/data/:orgs/:projectName/:tableName/views/:viewName',
  ncMetaAclMw(dataListNew)
);

router.post(
  '/data/:orgs/:projectName/:tableName/views/:viewName',
  ncMetaAclMw(dataInsertNew)
);
router.put(
  '/data/:orgs/:projectName/:tableName/views/:viewName/:rowId',
  ncMetaAclMw(dataUpdateNew)
);
router.delete(
  '/data/:orgs/:projectName/:tableName/views/:viewName/:rowId',
  ncMetaAclMw(dataDeleteNew)
);

export default router;
