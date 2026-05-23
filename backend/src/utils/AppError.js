class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(msg, details) { return new AppError(msg, 400, 'BAD_REQUEST', details); }
  static unauthorized(msg = 'Unauthorized') { return new AppError(msg, 401, 'UNAUTHORIZED'); }
  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403, 'FORBIDDEN'); }
  static notFound(msg = 'Not found') { return new AppError(msg, 404, 'NOT_FOUND'); }
  static conflict(msg, details) { return new AppError(msg, 409, 'CONFLICT', details); }
  static tooMany(msg = 'Too many requests') { return new AppError(msg, 429, 'RATE_LIMITED'); }
}

module.exports = AppError;
