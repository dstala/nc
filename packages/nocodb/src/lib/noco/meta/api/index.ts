import projectApis from './projectApis';
import tableApis from './tableApis';
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
import exportApis from './exportApis';
import auditApis from './auditApis';
import hookApis from './hookApis';
import pluginApis from './pluginApis';
import gridViewColumnApis from './gridViewColumnApis';
import { userApis } from './userApi';
// import extractProjectIdAndAuthenticate from './helpers/extractProjectIdAndAuthenticate';
import utilApis from './utilApis';
import projectUserApis from './projectUserApis';
import sharedBaseApis from './sharedBaseApis';
import { initStrategies } from './userApi/initStrategies';
import modelVisibilityApis from './modelVisibilityApis';
import metaDiffApis from './metaDiffApis';
import cacheApis from './cacheApis';
import apiTokenApis from './apiTokenApis';
import hookFilterApis from './hookFilterApis';
import {
  bulkDataAliasApis,
  dataAliasApis,
  dataApis,
  oldDataApis
} from './dataApis';
import {
  publicDataApis,
  publicDataExportApis,
  publicMetaApis
} from './publicApis';

export default function(router: Router) {
  initStrategies(router);
  projectApis(router);
  utilApis(router);

  router.use(columnApis);
  router.use(exportApis);
  router.use(dataApis);
  router.use(bulkDataAliasApis);
  router.use(dataAliasApis);
  router.use(oldDataApis);
  router.use(sortApis);
  router.use(filterApis);
  router.use(viewColumnApis);
  router.use(gridViewApis);
  router.use(formViewColumnApis);
  router.use(publicDataApis);
  router.use(publicDataExportApis);
  router.use(publicMetaApis);
  router.use(gridViewColumnApis);
  router.use(tableApis);
  router.use(galleryViewApis);
  router.use(formViewApis);
  router.use(viewApis);
  router.use(attachmentApis);
  router.use(auditApis);
  router.use(hookApis);
  router.use(pluginApis);
  router.use(projectUserApis);
  router.use(sharedBaseApis);
  router.use(modelVisibilityApis);
  router.use(metaDiffApis);
  router.use(cacheApis);
  router.use(apiTokenApis);
  router.use(hookFilterApis);

  userApis(router);
}
