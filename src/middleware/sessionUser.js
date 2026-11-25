import { findUserById } from '../models/userModel.js';

export const sessionUser = async (req, res, next) => {
  res.locals.currentUser = null;
  if (!req.session.userId) return next();

  const user = await findUserById(req.session.userId);
  if (!user) {
    delete req.session.userId;
    return next();
  }

  req.user = user;
  res.locals.currentUser = user;
  next();
};