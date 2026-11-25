import { body } from 'express-validator';
import { findUserByEmail, findUserByUsername } from '../../models/userModel.js';

export const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters.')
    .matches(/^[A-Za-z0-9_-]+$/).withMessage('Use only letters, numbers, underscores, and hyphens.')
    .custom(async (value) => {
      if (await findUserByUsername(value)) throw new Error('That username is taken.');
    }),

  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address.')
    .isLength({ max: 254 })
    .toLowerCase()
    .custom(async (value) => {
      if (await findUserByEmail(value)) throw new Error('An account with that email already exists.');
    }),

  body('password')
    .isLength({ max: 72 }).withMessage('Password must be 72 characters or fewer.')
    .isStrongPassword().withMessage('Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a symbol.'),

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').toLowerCase(),
  body('password').notEmpty().withMessage('Enter your password.'),
];