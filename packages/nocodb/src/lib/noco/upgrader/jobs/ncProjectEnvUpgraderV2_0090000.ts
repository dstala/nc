import { NcUpgraderCtx } from '../NcUpgrader';
import Noco from '../../Noco';
import User from '../../../noco-models/User';
import Project from '../../../noco-models/Project';
import ProjectUser from '../../../noco-models/ProjectUser';
import Model from '../../../noco-models/Model';
import { ModelTypes } from 'nc-common';
import Column from '../../../noco-models/Column';

export default async function(ctx: NcUpgraderCtx) {
  const ncMeta = ctx.ncMeta;

  await migrateUsers(ncMeta);
  await migrateProjects(ncMeta);
  await migrateProjectUsers(ncMeta);
  await migrateProjectModels(ncMeta);

  // const projects = await ctx.ncMeta.projectList();
  //
  // for (const project of projects) {
  //   const projectConfig = JSON.parse(project.config);
  //
  //   /*    const projectBuilder = new NcProjectBuilder(this, this.config, project);
  //   this.projectBuilders.push(projectBuilder);
  //   let i = 0;
  //   for (const builder of this.projectBuilders) {
  //     if (
  //       projects[i].status === 'started' ||
  //       projects[i].status === 'starting'
  //     ) {
  //       await builder.init();
  //     }
  //     i++;
  //   }*/
  // }
}

async function migrateUsers(ncMeta = Noco.ncMeta) {
  const users = await ncMeta.metaList(null, null, 'xc_users');
  const userList: User[] = [];

  for (const user of users) {
    userList.push(await User.insert(user, ncMeta));
  }
  return userList;
}

async function migrateProjects(ncMeta = Noco.ncMeta) {
  const projects = await ncMeta.projectList();
  const projectList: Project[] = [];

  for (const project of projects) {
    const projectConfig = JSON.parse(project.config);

    const projectBody = {
      id: project.id,
      prefix: projectConfig.prefix,
      is_meta: !!projectConfig.prefix,
      title: projectConfig?.title,
      bases: projectConfig?.envs?._noco?.db?.map(d => ({
        is_meta: !!projectConfig.prefix,
        type: d.client,
        config: d
      }))
    };

    projectList.push(await Project.createProject(projectBody, ncMeta));
  }
}

async function migrateProjectUsers(ncMeta = Noco.ncMeta) {
  const projectUsers = await ncMeta.metaList(null, null, 'nc_projects_users');

  for (const projectUser of projectUsers) {
    await ProjectUser.insert(
      {
        project_id: projectUser.project_id,
        fk_user_id: projectUser.user_id,
        roles: projectUser.roles
      },
      ncMeta
    );
  }
}

async function migrateProjectModels(ncMeta = Noco.ncMeta) {
  const metas: any[] = await ncMeta.metaList(null, null, 'nc_models');
  const models: Model[] = [];

  // variable for keeping all
  const objModelRef: {
    [projectId: string]: {
      [tableName: string]: Model;
    };
  } = {};
  const objModelColumnRef: {
    [projectId: string]: {
      [tableName: string]: {
        [columnName: string]: Column;
      };
    };
  } = {};

  const viewsInsert: Array<() => Promise<any>> = [];

  for (const modelData of metas) {
    // @ts-ignore
    let queryParams = {};
    if (modelData.query_params) {
      queryParams = JSON.parse(modelData.query_params);
    }

    if (modelData.type === 'table' || modelData.type === 'view') {
      // parse meta

      const project = await Project.getWithInfo(modelData.project_id, ncMeta);
      const baseId = project.bases[0].id;

      const meta = JSON.parse(modelData.meta);
      const model = await Model.insert(
        project.id,
        baseId,
        {
          tn: modelData.title,
          _tn: modelData.alias,
          type: modelData.type === 'table' ? ModelTypes.TABLE : ModelTypes.VIEW
        },
        ncMeta
      );
      models.push(model);

      objModelRef[project.id] = objModelRef[project.id] || {};
      objModelRef[project.id][model.tn] = model;

      objModelColumnRef[project.id] = objModelColumnRef[project.id] || {};
      objModelColumnRef[project.id][model.tn] =
        objModelColumnRef[project.id][model.tn] || {};

      // migrate table columns
      for (const columnMeta of meta.columns) {
        const column = await Column.insert(
          {
            ...columnMeta,
            fk_model_id: model.id
          },
          ncMeta
        );

        objModelColumnRef[project.id][model.tn][column.cn] = column;
      }

      viewsInsert.push(async () => {
        // insert default view data here
      });
    } else {
      viewsInsert.push(async () => {
        // insert view data here
      });
    }
  }
}

/***
 *
 users
 - copy users

 projects
 - copy project
 - create bases
 project user roles
 - map users to project

 models
 - create model data and column data

 views
 - create views and view columns
 - set order , visibility

 fields
 - populate view columns

 filters
 - copy view filters

 sorts
 - copy view sorts

 plugins configuration
 - copy plugin configurations

 audits
 -

 todo: api tokens
 - add migration
 - copy api tokens

 webhooks
 - copy webhooks

 model_role_ui_acl
 - copy ui acl

 shared views
 - copy shared views id to corresponding view

 shared base
 - copy shared base id


 */
