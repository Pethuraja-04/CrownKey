const service = require('../services/review.service');
const asyncHandler = require('../utils/asyncHandler');

// Validation is handled upstream by Zod (review.validator.js).
// The controller focuses only on calling the service and shaping the response.

const add = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const data = await service.add(req.user.id, req.params.propertyId, { rating, comment });
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const data = await service.update(req.user.id, req.params.id, { rating, comment });
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, req.params.id);
  res.json({ success: true, data: { ok: true } });
});

module.exports = { add, update, remove };
