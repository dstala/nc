import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { PagedResponseImpl } from './PagedResponse';
import {
  Table,
  TableList,
  TableListParams,
  TableReq
} from '../../../noco-client/Api';
import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import Project from '../../../noco-models/Project';

export default function() {
  const router = Router({ mergeParams: true });

  router.get('/:tableId', async (req: Request, res: Response<Table>) => {
    const table = await Model.getWithInfo({
      base_id: req.params.projectId,
      id: req.params.tableId
    });
    res.json(table);
  });
  router.get(
    '/',
    async (
      req: Request<any, any, any, TableListParams>,
      res: Response<TableList>
    ) => {
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
  );
  router.post('/', async (req: Request<any, any, TableReq>, res, next) => {
    try {
      console.log(req.params);

      const project = await Project.getWithInfo(req.params.projectId);
      const base = project.bases?.[0];
      const sqlMgr = await ProjectMgrv2.getSqlMgr(project);

      await sqlMgr.sqlOpPlus(base, 'tableCreate', req.body);

      res.json(await Model.insert(project.id, base.id, req.body));
    } catch (e) {
      console.log(e);
      next(e);
    }
  });
  router.put('/:tableId', (req, res) => {
    console.log(req.params);

    res.json({ msg: 'success' });
  });
  router.delete('/:tableId', (req, res) => {
    console.log(req.params);

    res.json({ msg: 'success' });
  });
  return router;
}
