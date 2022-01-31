import { Router } from 'express';

export default function() {
  const router = Router();

  router.get('/:tableId', (req, res) => {
    console.log(req.params);

    res.json({ msg: 'success' });
  });
  // router.post('/', (req, res) => {});
  // router.put('/:tableId', (req, res) => {});
  // router.delete('/:tableId', (req, res) => {});
  return router;
}
