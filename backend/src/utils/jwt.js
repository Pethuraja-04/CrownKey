const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const signAccess = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });

const signRefresh = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtl });

const verifyAccess = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefresh = (token) => jwt.verify(token, env.jwt.refreshSecret);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Convert "30d" / "15m" / "3600" to a future Date.
const ttlToDate = (ttl) => {
  if (/^\d+$/.test(ttl)) return new Date(Date.now() + parseInt(ttl, 10) * 1000);
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) throw new Error(`Bad TTL format: ${ttl}`);
  const n = parseInt(match[1], 10);
  const mult = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[match[2]];
  return new Date(Date.now() + n * mult);
};

module.exports = {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
  hashToken,
  ttlToDate,
};
