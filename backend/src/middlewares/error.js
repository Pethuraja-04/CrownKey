const AppError = require('../utils/AppError');

// 404 handler — must come after all routes.
const notFound = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details = err.details || undefined;

  // Prisma known errors → friendlier responses.
  if (err && err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      status = 409;
      code = 'CONFLICT';
      message = `Unique constraint failed on field(s): ${err.meta?.target?.join(', ')}`;
    } else if (err.code === 'P2025') {
      status = 404;
      code = 'NOT_FOUND';
      message = 'Record not found';
    }
  }

  if (err && err.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }
  if (err && err.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    error: { code, message, details },
  });
};

module.exports = { notFound, errorHandler };
