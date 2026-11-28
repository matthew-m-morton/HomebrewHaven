import { Router } from 'express';
import { requireLogin } from '../middleware/auth.js';
import { showAccount } from '../controllers/accountController.js';
import { deleteAccountRules, CONFIRM_PHRASE } from '../middleware/validators/accountValidators.js';
import {handleValidation} from '../middleware/validators/handleValidation.js';
import { showDeleteAccount, deleteAccount } from '../controllers/accountController.js';

const router = Router();

const setConfirmPhrase = (req, res, next) => {
  res.locals.confirmPhrase = CONFIRM_PHRASE;
  next();
};

router.get('/account', requireLogin, showAccount);

router.get('/account/delete', requireLogin, setConfirmPhrase, showDeleteAccount);
router.post('/account/delete', requireLogin, setConfirmPhrase, deleteAccountRules,
  handleValidation('account/delete', 'Delete account'), deleteAccount);

export default router;