import projectApis from './projectApis';
import tableApis from './tableApis';
import dataApis from './dataApis';
import columnApis from './columnApis';
import { Router } from 'express';
import sortApis from './sortApis';
import filterApis from './filterApis';
import viewColumnApis from './viewColumnApis';
import gridViewApis from './gridViewApis';
import viewApis from './viewApis';
import galleryViewApis from './galleryViewApis';
import formViewApis from './formViewApis';
import formViewColumnApis from './formViewColumnApis';
import attachmentApis from './attachmentApis';
import publicDataApis from './publicDataApis';
import publicMetaApis from './publicMetaApis';
import exportApis from './exportApis';
import auditApis from './auditApis';
import hookApis from './hookApis';
import pluginApis from './pluginApis';
import gridViewColumnApis from './gridViewColumnApis';

export default function(router: Router) {
  router.use('/projects', projectApis);
  router.use('/tables/:tableId/columns', columnApis);
  router.use('/data/:viewId', dataApis);
  router.use('/views/:viewId/sorts', sortApis);
  router.use('/views/:viewId/filters', filterApis);
  router.use('/views/:viewId/columns', viewColumnApis);
  router.use('/tables/:tableId/grids', gridViewApis);
  router.use('/formColumns', formViewColumnApis);
  router.use('/public/data/:uuid', publicDataApis);
  router.use('/public/meta/:uuid', publicMetaApis);

  router.use(gridViewColumnApis);
  router.use(tableApis);
  router.use(galleryViewApis);
  router.use(formViewApis);
  router.use(viewApis);
  router.use(attachmentApis);
  router.use(exportApis);
  router.use(auditApis);
  router.use(hookApis);
  router.use(pluginApis);
}
