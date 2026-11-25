import bcrypt from 'bcrypt';
import { matchedData } from 'express-validator';
import { createUser, findUserByEmail } from '../models/userModel.js';

const SALT_ROUNDS = 12;
const DUMMY_HASH = await bcrypt.hash('timing-equalizer', SALT_ROUNDS);

const regenerate = (req) =>
  new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));

const destroy = (req) =>
  new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));

const safeReturnTo = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/';

export const register = async (req, res) => {
  const { username, email, password } = matchedData(req);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ username, email, passwordHash });
  req.flash('success', `Account created! Your friend code is ${user.friend_code}. Log in to get started.`);
  res.redirect('/login');
};

export const showLogin = (req, res) => {
  res.render('auth/login', { title: 'Log in', errors: {}, values: {} });
};

export const login = async (req, res) => {
  const { email, password } = matchedData(req);
  const user = await findUserByEmail(email);
  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !valid) {
    return res.status(401).render('auth/login', {
      title: 'Log in',
      errors: { form: { msg: 'Incorrect email or password.' } },
      values: { email },
    });
  }

  const returnTo = safeReturnTo(req.session.returnTo);
  await regenerate(req);
  req.session.userId = user.id;
  req.flash('success', `Welcome back, ${user.username}!`);
  res.redirect(returnTo);
};

export const logout = async (req, res) => {
  await destroy(req);
  res.clearCookie('hh.sid');
  res.redirect('/');
};

export const showRegister = (req, res) => {
  res.render('auth/register', { title: 'Create an account', errors: {}, values: {} });
};