import { Router } from 'express';
import { showHome } from '../controllers/indexController.js';

const router = Router();
router.get('/', showHome);
export default router;


router.get('/boom', async () => {
  throw new Error('Test explosion');
});