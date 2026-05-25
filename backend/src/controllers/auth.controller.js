const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const setAuthCookies = (res, data) => {
  const isProd = env.nodeEnv === 'production';
  res.cookie('accessToken', data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // Must be lax to support cross-domain dev
    maxAge: 15 * 60 * 1000 // 15 mins
  });
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // Must be lax to support cross-domain dev
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  setAuthCookies(res, data);
  res.status(201).json({ success: true, data: { user: data.user } });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  setAuthCookies(res, data);
  res.json({ success: true, data: { user: data.user } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const data = await authService.refresh({ refreshToken: token });
  setAuthCookies(res, data);
  res.json({ success: true, data: { user: data.user } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await authService.logout({ refreshToken: token });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, data: { ok: true } });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.user.id);
  res.json({ success: true, data });
});

module.exports = { register, login, refresh, logout, me };
