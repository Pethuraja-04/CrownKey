const { verifyAccess } = require('../utils/jwt');
const AppError = require('../utils/AppError');

// Hard auth — fail if no/invalid token.
const requireAuth = (req, _res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) token = header.slice(7);
  }
  
  if (!token) {
    return next(AppError.unauthorized('Missing bearer token'));
  }
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
};

// Soft auth — populate req.user if token is present and valid; otherwise continue.
const optionalAuth = (req, _res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) token = header.slice(7);
  }
  
  if (!token) return next();
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
  } catch {
    // ignore — treat as anonymous
  }
  next();
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(AppError.unauthorized());
  if (!roles.includes(req.user.role)) return next(AppError.forbidden());
  next();
};

module.exports = { requireAuth, optionalAuth, requireRole };
