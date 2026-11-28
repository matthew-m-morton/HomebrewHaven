import { body } from 'express-validator';

export const CONFIRM_PHRASE = 'yes I want to delete';

export const deleteAccountRules = [
  body('confirm')
    .trim()
    .custom((v) => v.toLowerCase() === CONFIRM_PHRASE.toLowerCase())
    .withMessage(`Type "${CONFIRM_PHRASE}" to confirm.`),
  body('password').notEmpty().withMessage('Enter your password.'),
];