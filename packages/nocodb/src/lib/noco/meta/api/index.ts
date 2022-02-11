import projectApis from './projectApis';
import tableApis from './tableApis';
import dataApis from './dataApis';
import columnApis from './columnApis';
import { Router } from 'express';
import sortApis from './sortApis';
import filterApis from './filterApis';

export default function(router: Router) {
  router.use('/projects', projectApis);
  router.use('/tables/:tableId/columns', columnApis);
  router.use('/', tableApis);
  router.use('/data/:viewId', dataApis);
  router.use('/views/:viewId/sorts', sortApis);
  router.use('/views/:viewId/filters', filterApis);
}
