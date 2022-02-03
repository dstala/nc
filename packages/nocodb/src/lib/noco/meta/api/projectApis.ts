import { Request, Response, Router } from 'express';
import table from './tableApis';
import Project from '../../../noco-models/Project';
import { ProjectList, ProjectListParams } from '../../../noco-client/Api';
import { PagedResponseImpl } from './helpers/PagedResponse';
// import ProjectMgrv2 from '../../../sqlMgr/v2/ProjectMgrv2';
import syncMigration from './helpers/syncMigration';
import dataApis from './dataApis';

export default function(router: Router) {
  // // Project CRUD
  router.get(
    '/project/:projectId',
    async (
      req: Request<any, any, any, ProjectListParams>,
      res: Response<ProjectList>
    ) => {
      console.log(req.query.page);
      const projects = await Project.list({});

      res // todo: pagination
        .json({
          projects: new PagedResponseImpl(projects, {
            totalRows: projects.length,
            pageSize: 20,
            page: 1
          })
        });
    }
  );
  //
  //

  // project create api
  router.post('/projects', async (req, res, next) => {
    console.log(req.body);
    try {
      const project = await Project.createProject(req.body);

      // await ProjectMgrv2.getSqlMgr(project).projectOpenByWeb();
      await syncMigration(project);
      res.json(project);
    } catch (e) {
      console.log(e);
      next(e);
    }
  });

  // Table CRUD
  router.use('/projects/:projectId/:baseId/tables', table());
  router.use('/data/projects/:projectId/:baseId/tables', dataApis());
}
