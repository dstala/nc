import { Request, Response, Router } from 'express';
import Model from '../../../noco-models/Model';
import PagedResponse, { PagedResponseImpl } from './PagedResponse';

export default function() {
  const router = Router({ mergeParams: true });

  router.get('/:tableId', async (req: Request, res: Response<Model>) => {
    const table = await Model.get({
      base_id: req.params.projectId,
      id: req.params.tableId
    });
    res.json(table);
  });
  router.get('/', async (req: Request, res: Response<PagedResponse<any>>) => {
    const tables = await Model.list({
      project_id: req.params.projectId,
      db_alias: null
    });

    // todo: pagination
    res.json(
      new PagedResponseImpl({
        count: tables.length,
        content: tables,
        page: 1
      })
    );
  });
  // router.post('/', (req, res) => {
  //   console.log(req.params);
  //
  //   res.json({ msg: 'success' });
  // });
  // router.put('/:tableId', (req, res) => {});
  // router.delete('/:tableId', (req, res) => {});
  return router;
}
