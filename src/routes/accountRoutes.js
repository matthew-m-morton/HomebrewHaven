import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { showAccount } from '../controllers/accountController.js';

const router = Router();

router.get('/account', requireLogin, showAccount);

export default router;