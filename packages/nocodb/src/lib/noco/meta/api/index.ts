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
import { initJwtStrategy, userApis } from './userApi';
// import extractProjectIdAndAuthenticate from './helpers/extractProjectIdAndAuthenticate';
import utilApis from './utilApis';

export default function(router: Router) {
  initJwtStrategy(router);
  projectApis(router);
  utilApis(router);

  router.use('/tables/:tableId/columns', columnApis);
  router.use('/data/:viewId', dataApis);
  router.use(sortApis);
  router.use(filterApis);
  router.use(viewColumnApis);
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
  userApis(router);
}
