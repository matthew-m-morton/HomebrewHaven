import bcrypt from 'bcrypt';
import { matchedData } from 'express-validator';
import { findUserByEmail, countAdmins, deleteUserById } from '../models/userModel.js';

export function showDeleteAccount(req, res) {
  res.render('account/delete', { title: 'Delete account', errors: {}, values: {} });
}

export async function deleteAccount(req, res, next) {
  const { password } = matchedData(req);
  const renderError = (field, msg) =>
    res.status(400).render('account/delete', {
      title: 'Delete account',
      errors: { [field]: { msg } },
      values: { confirm: req.body.confirm },
    });

  const user = await findUserByEmail(req.user.email); // includes password_hash
  if (!(await bcrypt.compare(password, user.password_hash))) {
    return renderError('password', 'Incorrect password.');
  }
  if (req.user.role === 'admin' && (await countAdmins()) <= 1) {
    return renderError('form', 'You are the only admin. Promote another admin before deleting your account.');
  }

  await deleteUserById(req.user.id);

  // regenerate (not destroy) so the flash message survives the redirect
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.flash('success', 'Your account has been deleted.');
    res.redirect('/');
  });
}

export const showAccount = (req, res) => {
  res.render('account/index', { title: 'Your account' });
};