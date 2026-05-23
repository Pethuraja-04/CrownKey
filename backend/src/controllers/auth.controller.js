const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, data });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ success: true, data });
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body);
  res.json({ success: true, data });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body);
  res.json({ success: true, data: { ok: true } });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.user.id);
  res.json({ success: true, data });
});

module.exports = { register, login, refresh, logout, me };
