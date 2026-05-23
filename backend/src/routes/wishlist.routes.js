const express = require('express');
const ctrl = require('../controllers/wishlist.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Wishlist
 *     description: Per-user saved properties
 */

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: List the current user's saved properties
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *     responses:
 *       200: { description: Paginated list of saved properties }
 */
router.get('/', requireAuth, ctrl.list);

/**
 * @openapi
 * /api/wishlist/ids:
 *   get:
 *     tags: [Wishlist]
 *     summary: Return just the propertyIds in the current user's wishlist
 *     description: Light endpoint for hydrating client-side "is this saved" state.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of propertyId strings }
 */
router.get('/ids', requireAuth, ctrl.listIds);

/**
 * @openapi
 * /api/wishlist/{propertyId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a property to the current user's wishlist (idempotent)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Saved }
 *       404: { description: Property not found }
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove a property from the current user's wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Removed }
 */
router.post('/:propertyId', requireAuth, ctrl.add);
router.delete('/:propertyId', requireAuth, ctrl.remove);

module.exports = router;
