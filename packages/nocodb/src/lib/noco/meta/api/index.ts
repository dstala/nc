import projectApis from './projectApis';
import tableApis from './tableApis';
import dataApis from './dataApis';
import columnApis from './columnApis';
import { Router } from 'express';

export default function(router: Router) {
  router.use('/projects', projectApis);
  router.use('/tables/:tableId/columns', columnApis);
  router.use('/', tableApis);
  router.use('/data', dataApis);
}
