const service = require('../services/inquiry.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const data = await service.create({
    user: req.user || null,
    ip: req.ip,
    payload: req.body,
  });
  res.status(201).json({ success: true, data });
});

const listReceived = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
  const data = await service.listReceived(req.user.id, { page, limit });
  res.json({ success: true, ...data });
});

module.exports = { create, listReceived };
