export const requireLogin = (req, res, next) => {
  if (req.user) return next();

  if (req.method === 'GET') req.session.returnTo = req.originalUrl;
  req.flash('error', 'Please log in to continue.');
  res.redirect('/login');
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return requireLogin(req, res, next);
  if (roles.includes(req.user.role)) return next();

  const err = new Error('You failed your performance check. You do not have permission to view this page.');
  err.status = 403;
  next(err);
};