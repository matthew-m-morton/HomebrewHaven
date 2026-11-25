import bcrypt from 'bcrypt';
import { matchedData } from 'express-validator';
import { createUser } from '../models/userModel.js';

const SALT_ROUNDS = 12;

export const showRegister = (req, res) => {
  res.render('auth/register', { title: 'Create an account', errors: {}, values: {} });
};

export const register = async (req, res) => {
  const { username, email, password } = matchedData(req);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ username, email, passwordHash });
  res.status(201).render('auth/register-success', { title: 'Welcome', user });
};