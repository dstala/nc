import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { PagedResponseImpl } from './helpers/PagedResponse';
import {
  AuditOperationSubTypes,
  AuditOperationTypes,
  ModelTypes,
  TableListParamsType,
  TableListType,
  TableReqType,
  TableType,
  TableUpdatePayloadType
} from 'nc-common';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Project from '../../../noco-models/Project';
import Audit from '../../../noco-models/Audit';
import catchError from './helpers/catchError';
import ncMetaAclMiddleware from './helpers/ncMetaAclMiddleware';

export async function tableGet(req: Request, res: Response<TableType>) {
  const table = await Model.getWithInfo({
    id: req.params.tableId
  });
  res.json(table);
}

export async function tableList(
  req: Request<any, any, any, TableListParamsType>,
  res: Response<TableListType>
) {
  const tables = await Model.list({
    project_id: req.params.projectId,
    base_id: null
  });

  res // todo: pagination
    .json({
      tables: new PagedResponseImpl(tables, {
        totalRows: tables.length,
        pageSize: 20,
        page: 1
      })
    });
}

export async function tableCreate(
  req: Request<any, any, TableReqType>,
  res,
  next
) {
  try {
    console.log(req.params);

    const project = await Project.getWithInfo(req.params.projectId);
    const base = project.bases.find(b => b.id === req.params.baseId);
    const sqlMgr = await ProjectMgrv2.getSqlMgr(project);

    await sqlMgr.sqlOpPlus(base, 'tableCreate', req.body);

    const tables = await Model.list({
      project_id: project.id,
      base_id: base.id
    });

    Audit.insert({
      project_id: project.id,
      op_type: AuditOperationTypes.TABLE,
      op_sub_type: AuditOperationSubTypes.CREATED,
      user: (req as any)?.user?.email,
      description: `created table ${req.body.tn} with alias ${req.body._tn}  `,
      ip: (req as any).clientIp
    }).then(() => {});

    res.json(
      await Model.insert(project.id, base.id, {
        ...req.body,
        order: +(tables?.pop()?.order ?? 0) + 1
      })
    );
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export async function tableUpdate(
  req: Request<any, any, TableUpdatePayloadType>,
  res
) {
  console.log(req.params);

  await Model.updateAlias(req.params.tableId, req.body._tn);

  res.json({ msg: 'success' });
}

export async function tableDelete(req: Request, res: Response, next) {
  try {
    console.log(req.params);
    const table = await Model.get({ id: req.params.tableId });

    const project = await Project.getWithInfo(table.project_id);
    const base = project.bases.find(b => b.id === table.base_id);
    const sqlMgr = await ProjectMgrv2.getSqlMgr(project);

    if (table.type === ModelTypes.TABLE)
      await sqlMgr.sqlOpPlus(base, 'tableDelete', table);
    else if (table.type === ModelTypes.VIEW)
      await sqlMgr.sqlOpPlus(base, 'viewDelete', {
        ...table,
        view_name: table.tn
      });

    Audit.insert({
      project_id: project.id,
      op_type: AuditOperationTypes.TABLE,
      op_sub_type: AuditOperationSubTypes.DELETED,
      user: (req as any)?.user?.email,
      description: `Deleted ${table.type} ${table.tn} with alias ${table._tn}  `,
      ip: (req as any).clientIp
    }).then(() => {});

    res.json(table.delete());
  } catch (e) {
    console.log(e);
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get(
  '/projects/:projectId/:baseId/tables',
  ncMetaAclMiddleware('tableList'),
  catchError(tableList)
);
router.post(
  '/projects/:projectId/:baseId/tables',
  ncMetaAclMiddleware('tableCreate'),
  catchError(tableCreate)
);
router.get(
  '/tables/:tableId',
  ncMetaAclMiddleware('tableXcModelGet'),
  catchError(tableGet)
);
router.put(
  '/tables/:tableId',
  ncMetaAclMiddleware('xcModelSet'),
  catchError(tableUpdate)
);
router.delete(
  '/tables/:tableId',
  ncMetaAclMiddleware('tableDelete'),
  catchError(tableDelete)
);
export default router;
