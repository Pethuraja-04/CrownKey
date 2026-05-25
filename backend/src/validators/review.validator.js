const { z } = require('zod');

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000, 'Comment must be under 2000 characters'),
});

const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(2000).optional(),
}).refine(
  (data) => data.rating !== undefined || data.comment !== undefined,
  { message: 'At least one of rating or comment must be provided' }
);

module.exports = { createReviewSchema, updateReviewSchema };
