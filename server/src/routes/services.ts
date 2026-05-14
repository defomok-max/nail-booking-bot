import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const services = query('SELECT * FROM services WHERE active = 1 ORDER BY id');
  res.json(services);
});

export default router;
