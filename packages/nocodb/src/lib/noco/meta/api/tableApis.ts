import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import { PagedResponseImpl } from './PagedResponse';
import { Table, TableList } from '../../../noco-client/data-contracts';

export default function() {
  const router = Router({ mergeParams: true });

  router.get('/:tableId', async (req: Request, res: Response<Table>) => {
    const table = await Model.getWithInfo({
      base_id: req.params.projectId,
      id: req.params.tableId
    });
    res.json(table);
  });
  router.get('/', async (req: Request<>, res: Response<TableList>) => {
    const tables = await Model.list({
      project_id: req.params.projectId,
      db_alias: null
    });

    // todo: pagination
    res.json({
      tables: new PagedResponseImpl(tables, {
        totalRows: tables.length,
        pageSize: 20,
        page: 1
      })
    });
  });
  router.post('/', (req, res) => {
    console.log(req.params);

    res.json({ msg: 'success' });
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
