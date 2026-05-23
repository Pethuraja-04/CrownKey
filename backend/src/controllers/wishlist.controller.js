const service = require('../services/wishlist.service');
const asyncHandler = require('../utils/asyncHandler');

const add = asyncHandler(async (req, res) => {
  const data = await service.add(req.user.id, req.params.propertyId);
  res.status(201).json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, req.params.propertyId);
  res.json({ success: true, data: { ok: true } });
});

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const data = await service.list(req.user.id, { page, limit });
  res.json({ success: true, ...data });
});

const listIds = asyncHandler(async (req, res) => {
  const ids = await service.listIds(req.user.id);
  res.json({ success: true, data: ids });
});

module.exports = { add, remove, list, listIds };
