import projectApis from './projectApis';
import tableApis from './tableApis';
import dataApis from './dataApis';
import columnApis from './columnApis';
import { Router } from 'express';

export default function(router: Router) {
  router.use('/projects', projectApis);
  router.use('/projects/:projectId/:baseId/tables', tableApis);
  router.use(
    '/projects/:projectId/:baseId/tables/:tableId/columns',
    columnApis
  );
  router.use('/data/projects/:projectId/:baseId/tables', dataApis);
}
