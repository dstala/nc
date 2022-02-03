import projectApis from './projectApis';
import tableApis from './tableApis';
import dataApis from './dataApis';
import { Router } from 'express';

export default function(router: Router) {
  router.use('/projects', projectApis);
  router.use('/projects/:projectId/:baseId/tables', tableApis);
  router.use('/data/projects/:projectId/:baseId/tables', dataApis);
}
