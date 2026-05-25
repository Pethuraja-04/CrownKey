const service = require('../services/review.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const add = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (rating === undefined || comment === undefined) {
    throw AppError.badRequest('Rating and comment are required');
  }
  if (rating < 1 || rating > 5) {
    throw AppError.badRequest('Rating must be between 1 and 5');
  }

  const data = await service.add(req.user.id, req.params.propertyId, { rating, comment });
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw AppError.badRequest('Rating must be between 1 and 5');
  }

  const data = await service.update(req.user.id, req.params.id, { rating, comment });
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, req.params.id);
  res.json({ success: true, data: { ok: true } });
});

module.exports = {
  add,
  update,
  remove
};
