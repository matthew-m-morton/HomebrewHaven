import { Router } from 'express';
import { showRegister, register, showLogin, login, logout } from '../controllers/authController.js';
import { registerRules, loginRules } from '../middleware/validators/authValidators.js';
import { handleValidation } from '../middleware/validators/handleValidation.js';

const router = Router();

router.get('/register', showRegister);
router.post('/register', registerRules, handleValidation('auth/register', 'Create an account'), register);

router.get('/login', showLogin);
router.post('/login', loginRules, handleValidation('auth/login', 'Log in'), login);

router.post('/logout', logout);

export default router;