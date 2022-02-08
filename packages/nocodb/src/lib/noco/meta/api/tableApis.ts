import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { PagedResponseImpl } from './helpers/PagedResponse';
import { Table, TableList, TableListParams, TableReq } from 'nc-common';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Project from '../../../noco-models/Project';

export async function tableGet(req: Request, res: Response<Table>) {
  const table = await Model.getWithInfo({
    base_id: req.params.projectId,
    id: req.params.tableId
  });
  res.json(table);
}

export async function tableList(
  req: Request<any, any, any, TableListParams>,
  res: Response<TableList>
) {
  const tables = await Model.list({
    project_id: req.params.projectId,
    db_alias: null
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

export async function tableCreate(req: Request<any, any, TableReq>, res, next) {
  try {
    console.log(req.params);

    const project = await Project.getWithInfo(req.params.projectId);
    const base = project.bases.find(b => b.id === req.params.baseId);
    const sqlMgr = await ProjectMgrv2.getSqlMgr(project);

    await sqlMgr.sqlOpPlus(base, 'tableCreate', req.body);

    res.json(await Model.insert(project.id, base.id, req.body));
  } catch (e) {
    console.log(e);
    next(e);
  }
}

export async function tableUpdate(req, res) {
  console.log(req.params);

  res.json({ msg: 'success' });
}

export async function tableDelete(req: Request, res: Response, next) {
  try {
    console.log(req.params);

    const project = await Project.getWithInfo(req.params.projectId);
    const base = project.bases.find(b => b.id === req.params.baseId);
    const sqlMgr = await ProjectMgrv2.getSqlMgr(project);

    const table = await Model.get({ id: req.params.tableId });

    await sqlMgr.sqlOpPlus(base, 'tableDelete', table);

    res.json(table.delete());
  } catch (e) {
    console.log(e);
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get('/', tableList);
router.post('/', tableCreate);
router.get('/:tableId', tableGet);
router.put('/:tableId', tableUpdate);
router.delete('/:tableId', tableDelete);
export default router;
