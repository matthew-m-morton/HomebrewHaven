import { Router } from 'express';
import { showRegister, register } from '../controllers/authController.js';
import { registerRules } from '../middleware/validators/authValidators.js';
import { handleValidation } from '../middleware/validators/handleValidation.js';

const router = Router();

router.get('/register', showRegister);
router.post(
  '/register',
  registerRules,
  handleValidation('auth/register', 'Create an account'),
  register
);

export default router;