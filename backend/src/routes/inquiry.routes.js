const express = require('express');
const ctrl = require('../controllers/inquiry.controller');
const validate = require('../middlewares/validate');
const { requireAuth, optionalAuth } = require('../middlewares/auth');
const { inquiryLimiter } = require('../middlewares/rateLimit');
const { createSchema } = require('../validators/inquiry.validator');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Inquiries
 *     description: Lead / contact-owner submissions
 */

/**
 * @openapi
 * /api/inquiries:
 *   post:
 *     tags: [Inquiries]
 *     summary: Contact a property owner. Anonymous or authenticated.
 *     description: |
 *       Spam protection in layers:
 *         1. Rate limit per IP+email (configurable, default 5/hour).
 *         2. Unique constraint on (propertyId, userId) for logged-in users.
 *         3. 24h dedup window on (propertyId, email) for guests.
 *         4. Owner cannot inquire on their own listing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, name, email, phone, message]
 *             properties:
 *               propertyId: { type: string, format: uuid }
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               message: { type: string, minLength: 10 }
 *     responses:
 *       201: { description: Inquiry sent }
 *       409: { description: Duplicate inquiry }
 *       429: { description: Rate limited }
 */
router.post('/', optionalAuth, inquiryLimiter, validate(createSchema), ctrl.create);

/**
 * @openapi
 * /api/inquiries/received:
 *   get:
 *     tags: [Inquiries]
 *     summary: Inquiries received on the current user's listings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated inquiries }
 */
router.get('/received', requireAuth, ctrl.listReceived);

module.exports = router;
