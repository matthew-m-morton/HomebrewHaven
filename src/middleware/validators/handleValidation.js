import { validationResult } from 'express-validator';

export const handleValidation = (view, title) => (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  res.status(400).render(view, {
    title,
    errors: result.mapped(),
    values: { ...req.body, password: '', confirmPassword: '' },
  });
};