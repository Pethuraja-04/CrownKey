const express = require('express');
const ctrl = require('../controllers/review.controller');
const { requireAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createReviewSchema, updateReviewSchema } = require('../validators/review.validator');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: Property ratings and reviews — one review per user per property
 */

/**
 * @openapi
 * /api/reviews/properties/{propertyId}:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a star rating and comment for a property
 *     description: |
 *       Rules enforced:
 *         1. Must be authenticated.
 *         2. Property owner cannot review their own listing.
 *         3. One review per user per property (409 if already exists).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID of the property to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: Star rating from 1 (poor) to 5 (excellent)
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Great locality and well-maintained property. Owner was very responsive."
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400: { description: Validation error (missing/invalid rating or comment) }
 *       401: { description: Not authenticated }
 *       403: { description: Owner cannot review own listing }
 *       404: { description: Property not found }
 *       409: { description: User has already reviewed this property }
 */
router.post('/properties/:propertyId', requireAuth, validate(createReviewSchema), ctrl.add);

/**
 * @openapi
 * /api/reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update your own review
 *     description: Only the review author can update it. Partial updates allowed (rating or comment independently).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Updated review after speaking with the owner."
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *       403: { description: You can only edit your own reviews }
 *       404: { description: Review not found }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete your own review
 *     description: Only the review author can delete it. The slot is then freed — the user can post a new review.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     ok: { type: boolean, example: true }
 *       401: { description: Not authenticated }
 *       403: { description: You can only delete your own reviews }
 *       404: { description: Review not found }
 */
router.patch('/:id', requireAuth, validate(updateReviewSchema), ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
