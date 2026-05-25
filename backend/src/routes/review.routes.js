const express = require('express');
const ctrl = require('../controllers/review.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Mount review actions under /api/reviews
router.post('/properties/:propertyId', requireAuth, ctrl.add);
router.patch('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
