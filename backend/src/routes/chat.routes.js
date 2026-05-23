const express = require('express');
const ctrl = require('../controllers/chat.controller');
const validate = require('../middlewares/validate');
const { chatLimiter } = require('../middlewares/rateLimit');
const { messageSchema } = require('../validators/chat.validator');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Chat
 *     description: AI concierge (real-estate questions only)
 */

/**
 * @openapi
 * /api/chat/message:
 *   post:
 *     tags: [Chat]
 *     summary: Ask the Estatery AI concierge a question
 *     description: |
 *       Real AI powered by Groq (Llama 3.3). Strict system prompt restricts answers
 *       to Estatery usage and Indian real-estate topics. Off-topic questions
 *       get a fixed polite refusal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, minLength: 1, maxLength: 1500 }
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: AI reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply: { type: string }
 *                     model: { type: string }
 *       429: { description: Rate limited }
 *       400: { description: Validation error or missing API key }
 *       502: { description: Upstream AI error }
 */
router.post('/message', chatLimiter, validate(messageSchema), ctrl.message);

module.exports = router;
