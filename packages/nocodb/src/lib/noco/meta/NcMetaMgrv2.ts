import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';

import archiver from 'archiver';
import axios from 'axios';
import bodyParser from 'body-parser';
import express, { Handler, Router } from 'express';
import extract from 'extract-zip';
import isDocker from 'is-docker';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { SqlClientFactory, Tele } from 'nc-help';
import slash from 'slash';
import { v4 as uuidv4 } from 'uuid';
import { ncp } from 'ncp';

import IEmailAdapter from '../../../interface/IEmailAdapter';
import IStorageAdapter from '../../../interface/IStorageAdapter';
import { NcConfig, Result } from '../../../interface/config';
import { NcConfigFactory } from '../../index';
import ProjectMgr from '../../sqlMgr/ProjectMgr';
import ExpressXcTsRoutes from '../../sqlMgr/code/routes/xc-ts/ExpressXcTsRoutes';
import ExpressXcTsRoutesBt from '../../sqlMgr/code/routes/xc-ts/ExpressXcTsRoutesBt';
import ExpressXcTsRoutesHm from '../../sqlMgr/code/routes/xc-ts/ExpressXcTsRoutesHm';
import NcHelp from '../../utils/NcHelp';
import mimetypes, { mimeIcons } from '../../utils/mimeTypes';
import projectAcl from '../../utils/projectAcl';
import Noco from '../Noco';
import { GqlApiBuilder } from '../gql/GqlApiBuilder';
import NcPluginMgr from '../plugins/NcPluginMgr';
import XcCache from '../plugins/adapters/cache/XcCache';
import { RestApiBuilder } from '../rest/RestApiBuilder';
import RestAuthCtrl from '../rest/RestAuthCtrlEE';
import { packageVersion } from 'nc-help';
import NcMetaIO, { META_TABLES } from './NcMetaIO';
import { promisify } from 'util';
import NcTemplateParser from '../../templateParser/NcTemplateParser';
import UITypes from '../../sqlUi/UITypes';
import { defaultConnectionConfig } from '../../utils/NcConfigFactory';
import ncCreateLinkToAnotherRecord from "./handlersv2/ncCreateLinkToAnotherRecord";

const XC_PLUGIN_DET = 'XC_PLUGIN_DET';

const NOCO_RELEASE = 'NOCO_RELEASE';

export default class NcMetaMgrv2 {
  public projectConfigs = {};
  public readonly pluginMgr: NcPluginMgr;

  // public twilioInstance: Twilio;

  protected app: Noco;

  protected config: NcConfig;
  protected listener: (data) => Promise<any>;
  protected xcMeta: NcMetaIO;
  protected projectMgr: any;
  // @ts-ignore
  protected isEe = false;
  protected readonly INVALID_PASSWORD_ERROR = 'Invalid password';

  constructor(app: Noco, config: NcConfig, xcMeta: NcMetaIO) {
    this.app = app;
    this.config = config;
    this.xcMeta = xcMeta;
    this.projectMgr = ProjectMgr.make();
    this.pluginMgr = new NcPluginMgr(app, xcMeta);
  }

  public setConfig(config: NcConfig) {
    this.config = config;
  }

  public async initHandler(rootRouter: Router) {
    await this.pluginMgr?.init();

    // await this.initTwilio();
    await this.initCache();
    this.eeVerify();

    const router = Router();
    for (const project of await this.xcMeta.projectList()) {
      const config = JSON.parse(project.config);
      this.projectConfigs[project.id] = config;
      // const knexRefs = (this.app?.projectBuilders?.find(p => p.id === project.id)?.apiBuilders || []).reduce((ref, ab) => ({
      //   ...ref,
      //   [ab.dbAlias]: ab.getDbDriver()
      // }), {})
      this.projectMgr
        .getSqlMgr({ ...project, config, metaDb: this.xcMeta?.knex })
        .projectOpenByWeb(config);
    }

    // todo: acl
    router.get(/^\/dl\/([^/]+)\/([^/]+)\/(.+)$/, async (req, res) => {
      try {
        // const type = mimetypes[path.extname(req.params.fileName).slice(1)] || 'text/plain';
        const type =
          mimetypes[
            path
              .extname(req.params[2])
              .split('/')
              .pop()
              .slice(1)
          ] || 'text/plain';
        // const img = await this.storageAdapter.fileRead(slash(path.join('nc', req.params.projectId, req.params.dbAlias, 'uploads', req.params.fileName)));
        const img = await this.storageAdapter.fileRead(
          slash(
            path.join(
              'nc',
              req.params[0],
              req.params[1],
              'uploads',
              ...req.params[2].split('/')
            )
          )
        );
        res.writeHead(200, { 'Content-Type': type });
        res.end(img, 'binary');
      } catch (e) {
        res.status(404).send('Not found');
      }
    });

    router.use(
      bodyParser.json({
        limit: process.env.NC_REQUEST_BODY_SIZE || 1024 * 1024
      })
    );

    // todo: add multer middleware only for certain api calls
    if (!process.env.NC_SERVERLESS_TYPE && !this.config.try) {
      const upload = multer({
        storage: multer.diskStorage({
          // dest: path.join(this.config.toolDir, 'uploads')
        })
      });
      // router.post(this.config.dashboardPath, upload.single('file'));
      router.post(this.config.dashboardPath, upload.any());
    }

    router.post(this.config.dashboardPath, (req, res, next) =>
      this.handlePublicRequest(req, res, next)
    );

    // @ts-ignore
    router.post(this.config.dashboardPath, async (req: any, res, next) => {
      if (req.files && req.body.json) {
        req.body = JSON.parse(req.body.json);
      }
      if (req?.session?.passport?.user?.isAuthorized) {
        if (
          req?.body?.project_id &&
          !req.session?.passport?.user?.isPublicBase &&
          !(await this.xcMeta.isUserHaveAccessToProject(
            req?.body?.project_id,
            req?.session?.passport?.user?.id
          ))
        ) {
          return res
            .status(403)
            .json({ msg: "User doesn't have project access" });
        }

        if (req?.body?.api) {
          const roles = req?.session?.passport?.user?.roles;
          const isAllowed =
            roles &&
            Object.entries(roles).some(([name, hasRole]) => {
              return (
                hasRole &&
                projectAcl[name] &&
                (projectAcl[name] === '*' || projectAcl[name][req.body.api])
              );
            });
          if (!isAllowed) {
            return res.status(403).json({ msg: 'Not allowed' });
          }
        }
      }
      next();
    });
    router.post(
      this.config.dashboardPath,
      // handle request if it;s related to meta db
      (async (req: any, res, next): Promise<any> => {
        // auth to admin
        if (this.config.auth) {
          if (this.config.auth.jwt) {
            const roles = req?.session?.passport?.user?.roles;
            if (
              !(
                roles?.creator ||
                roles?.owner ||
                roles?.editor ||
                roles?.viewer ||
                roles?.commenter ||
                roles?.user ||
                roles?.user_new
              )
            ) {
              return res.status(401).json({
                msg:
                  'Unauthorized access : xc-auth does not have admin permission'
              });
            }
          } else if (this.config?.auth?.masterKey) {
            if (
              req.headers['xc-master-key'] !== this.config.auth.masterKey.secret
            ) {
              return res.status(401).json({
                msg:
                  'Unauthorized access : xc-admin header missing or not matching'
              });
            }
          }
        }

        if (req.files) {
          await this.handleRequestWithFile(req, res, next);
        } else {
          await this.handleRequest(req, res, next);
        }
      }) as Handler,
      // pass request to SqlMgr
      async (req: any, res) => {
        try {
          let output;
          if (req.files && req.body.json) {
            req.body = JSON.parse(req.body.json);
            output = await this.projectMgr
              .getSqlMgr({ id: req.body.project_id })
              .handleRequestWithFile(req.body.api, req.body, req.files);
          } else {
            output = await this.projectMgr
              .getSqlMgr({ id: req.body.project_id })
              .handleRequest(req.body.api, req.body);
          }

          if (this.listener) {
            await this.listener({
              req: req.body,
              res: output,
              user: req.user,
              ctx: {
                req,
                res
              }
            });
          }

          if (
            typeof output === 'object' &&
            'download' in output &&
            'filePath' in output &&
            output.download === true
          ) {
            return res.download(output.filePath);
          }
          res.json(output);
        } catch (e) {
          console.log(e);
          res.status(500).json({ msg: e.message });
        }
      }
    );

    router.get(
      `${this.config.dashboardPath}/auth/type`,
      async (_req, res): Promise<any> => {
        try {
          const projectHasDb = true; // this.toolMgr.projectHasDb();
          if (this.config.auth) {
            if (this.config.auth.jwt) {
              const knex = this.xcMeta.knex;

              let projectHasAdmin = false;
              projectHasAdmin = !!(await knex('xc_users').first());
              const result = {
                authType: 'jwt',
                projectHasAdmin,
                firstUser: !projectHasAdmin,
                projectHasDb,
                type: this.config.type,
                env: this.config.workingEnv,
                googleAuthEnabled: !!(
                  process.env.NC_GOOGLE_CLIENT_ID &&
                  process.env.NC_GOOGLE_CLIENT_SECRET
                ),
                githubAuthEnabled: !!(
                  process.env.NC_GITHUB_CLIENT_ID &&
                  process.env.NC_GITHUB_CLIENT_SECRET
                ),
                oneClick: !!process.env.NC_ONE_CLICK,
                connectToExternalDB: !process.env
                  .NC_CONNECT_TO_EXTERNAL_DB_DISABLED,
                version: packageVersion,
                defaultLimit: Math.max(
                  Math.min(
                    +process.env.DB_QUERY_LIMIT_DEFAULT || 25,
                    +process.env.DB_QUERY_LIMIT_MAX || 100
                  ),
                  +process.env.DB_QUERY_LIMIT_MIN || 1
                ),
                timezone: defaultConnectionConfig.timezone
              };
              return res.json(result);
            }
            if (this.config.auth.masterKey) {
              return res.json({
                authType: 'masterKey',
                // projectHasDb: this.toolMgr.projectHasDb(),
                type: this.config.type,
                env: this.config.workingEnv,
                oneClick: !!process.env.NC_ONE_CLICK
              });
            }
          }
          res.json({
            authType: 'none',
            projectHasDb,
            type: this.config.type,
            env: this.config.workingEnv,
            oneClick: !!process.env.NC_ONE_CLICK
          });
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
    );

    router.post('/auth/admin/verify', (req, res): any => {
      if (this.config.auth) {
        if (
          this.config.auth.masterKey &&
          this.config.auth.masterKey.secret === req.body.secret
        ) {
          return res.json(true);
        }
      }
      res.json(false);
    });

    router.post('/auth/xc-verify', (_req, res) => {
      this.isEe = true;
      res.json({ msg: 'success' });
    });

    rootRouter.use(router);
  }


  public setListener(listener: (data) => Promise<any>) {
    this.listener = listener;
  }
/*
  protected async handlePublicRequest(req, res, next) {
   /!* let args = req.body;

    try {
      if (req.body.json) args = JSON.parse(req.body.json);
    } catch {}
    let result;
    try {
      switch (args.api) {
        case 'displaySharedViewLink':
          result = await this.displaySharedViewLink(args);
          break;
        case 'getSharedViewData':
          result = await this.getSharedViewData(req, args);
          break;
        case 'sharedViewGet':
          result = await this.sharedViewGet(req, args);
          break;
        case 'sharedBaseGet':
          result = await this.sharedBaseGet(req, args);
          break;
        case 'sharedViewExportAsCsv':
          result = await this.sharedViewExportAsCsv(req, args, res);
          break;

        case 'sharedViewInsert':
          result = await this.sharedViewInsert(req, args);
          break;
        case 'sharedViewNestedDataGet':
          result = await this.sharedViewNestedDataGet(req, args);
          break;
        case 'sharedViewNestedChildDataGet':
          result = await this.sharedViewNestedChildDataGet(req, args);
          break;

        // case 'submitSharedViewFormData':
        //   result = await this.submitSharedViewFormData(req, args);
        //   break;

        case 'xcRelease':
          result = await this.xcRelease();
          break;

        default:
          return next();
      }
    } catch (e) {
      return next(e);
    }

    if (typeof result?.cb === 'function') {
      return await result.cb();
    }

    res.json(result);*!/
  }*/

  protected async handleRequest(req, res, next) {
    try {
      const args = req.body;
      let result, postListenerCb;

      switch (args.api) {
        case 'xcPluginDemoDefaults':
          result = await ncCreateLinkToAnotherRecord.call(this.getContext(args),args);
          break;

        default:
          return next();
      }
      if (this.listener) {
        await this.listener({
          user: req.user,
          req: req.body,
          res: result,
          ctx: {
            req,
            res
          }
        });
      }

      if (postListenerCb) {
        await postListenerCb();
      }

      if (
        result &&
        typeof result === 'object' &&
        'download' in result &&
        'filePath' in result &&
        result.download === true
      ) {
        return res.download(result.filePath);
      }

      if (typeof result?.cb === 'function') {
        return await result.cb();
      }

      res.json(result);
    } catch (e) {
      console.log(e);
      if (e instanceof XCEeError) {
        res.status(402).json({
          msg: e.message
        });
      } else {
        res.status(400).json({
          msg: e.message
        });
      }
    }
  }
  protected getDbAlias(args): string {
    return (
      args?.dbAlias ||
      args?.args?.dbAlias ||
      args?.db_alias ||
      args?.args?.db_alias
    );
  }
  protected getProjectId(args): string {
    return args.project_id;
  }


  private getContext(args):NcContextV2{
    return {
      projectId: this.getProjectId(args),
      dbAlias:this.getDbAlias(args),
      xcMeta:this.xcMeta
    }
  }
}


export interface NcContextV2{
  projectId: string;
  dbAlias:string;
  xcMeta: NcMetaIO;
}

export class XCEeError extends Error {
  public static throw() {
    throw new XCEeError('Upgrade to Enterprise Edition');
  }
}

/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
