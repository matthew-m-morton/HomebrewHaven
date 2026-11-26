const TITLES = { 400: 'Bad request', 403: 'Access denied', 500: 'Something went wrong' };

export const notFound = (req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (status >= 500) console.error(err);
  if (res.headersSent) return next(err);

  res.status(status);

  if (status === 404) {
    return res.render('errors/404', { title: 'Page not found' });
  }

  res.render('errors/error', {
    title: TITLES[status] || 'Something went wrong',
    status,
    message: status < 500 ? err.message : 'An unexpected error occurred.',
    stack: isProd ? null : err.stack,
  });
};