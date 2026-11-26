import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.use('/admin', requireRole('admin'));

router.get('/admin', (req, res) => {
  res.render('admin/index', { title: 'Admin dashboard' });
});

export default router;