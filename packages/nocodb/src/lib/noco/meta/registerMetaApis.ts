import { Router } from 'express';
import table from './api/table';
import Project from '../../noco-models/Project';

export default function(router: Router) {
  // // Project CRUD
  // router.get('/project/:projectId', (req, res) => {
  //   res.
  // })
  //
  //

  // project create api
  router.post('/projects', async (req, res) => {
    console.log(req.body);
    try {
      const project = await Project.createProject(req.body);
      res.json(project);
    } catch (e) {
      console.log(e);
      res.status(500).json({ err: e.message });
    }
  });

  // Table CRUD
  router.use('/projects/:projectId/tables', table());
}
