const AppError = require('../utils/AppError');

// Validate a request part with a Zod schema and replace it with the parsed value.
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(AppError.badRequest('Validation failed', details));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
