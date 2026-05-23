const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const {
  signAccess,
  signRefresh,
  verifyRefresh,
  hashToken,
  ttlToDate,
} = require('../utils/jwt');

const sanitize = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

const issueTokens = async (user) => {
  const claims = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccess(claims);
  const refreshToken = signRefresh(claims);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: ttlToDate(env.jwt.refreshTtl),
    },
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, phone }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw AppError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone },
  });

  const tokens = await issueTokens(user);
  return { user: sanitize(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw AppError.unauthorized('Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid email or password');

  const tokens = await issueTokens(user);
  return { user: sanitize(user), ...tokens };
};

const refresh = async ({ refreshToken }) => {
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired or revoked');
  }
  if (stored.userId !== payload.sub) throw AppError.unauthorized('Token mismatch');

  // Rotate: revoke old, issue new pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokens(stored.user);
  return { user: sanitize(stored.user), ...tokens };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revoked: false },
    data: { revoked: true },
  });
};

const me = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  return sanitize(user);
};

module.exports = { register, login, refresh, logout, me };
