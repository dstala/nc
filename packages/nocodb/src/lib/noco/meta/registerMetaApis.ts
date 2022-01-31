import { Router } from 'express';
import table from './api/table';

export default function(router: Router) {
  // // Project CRUD
  // router.get('/project/:projectId', (req, res) => {
  //   res.
  // })

  // Table CRUD
  router.use('/projects/:projectId/tables', table());
}
