const express = require('express');
const auth = require('./auth.routes');
const properties = require('./property.routes');
const inquiries = require('./inquiry.routes');
const chat = require('./chat.routes');
const wishlist = require('./wishlist.routes');
const reviews = require('./review.routes');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', ts: Date.now() } }));

router.use('/auth', auth);
router.use('/properties', properties);
router.use('/inquiries', inquiries);
router.use('/chat', chat);
router.use('/wishlist', wishlist);
router.use('/reviews', reviews);

module.exports = router;
