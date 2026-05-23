const express = require('express');
const ctrl = require('../controllers/property.controller');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const {
  createSchema,
  updateSchema,
  listQuerySchema,
} = require('../validators/property.validator');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Properties
 *     description: Property listings — create, search, filter, similar
 */

/**
 * @openapi
 * /api/properties:
 *   get:
 *     tags: [Properties]
 *     summary: Search & filter properties
 *     description: |
 *       Paginated list of ACTIVE properties. All query params are optional; the
 *       backend applies them as AND filters on the indexed columns. Combine
 *       freely — e.g. `?city=Pune&type=PG&roomType=SINGLE&isVerified=true&postedWithin=7d`.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, maxLength: 120 }
 *         description: Free-text match on title / locality / city (case-insensitive).
 *       - in: query
 *         name: city
 *         schema: { type: string, maxLength: 80 }
 *         example: Mumbai
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [APARTMENT, HOUSE, VILLA, PLOT, COMMERCIAL, PG] }
 *       - in: query
 *         name: listingType
 *         schema: { type: string, enum: [SALE, RENT] }
 *       - in: query
 *         name: bedrooms
 *         schema: { type: integer, minimum: 0, maximum: 20 }
 *         description: Minimum bedrooms (BHK). Ignored when `type=PG` — use `roomType` instead.
 *       - in: query
 *         name: bathrooms
 *         schema: { type: integer, minimum: 0, maximum: 20 }
 *         description: Minimum bathrooms.
 *       - in: query
 *         name: roomType
 *         schema: { type: string, enum: [SINGLE, DOUBLE, TRIPLE, QUAD, DORMITORY] }
 *         description: Occupancy type for PG/Hostel listings.
 *       - in: query
 *         name: minPrice
 *         schema: { type: number, minimum: 0 }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number, minimum: 0 }
 *       - in: query
 *         name: minArea
 *         schema: { type: integer, minimum: 0 }
 *         description: Minimum carpet/built-up area in sq ft.
 *       - in: query
 *         name: maxArea
 *         schema: { type: integer, minimum: 0 }
 *         description: Maximum carpet/built-up area in sq ft.
 *       - in: query
 *         name: furnishing
 *         schema: { type: string, enum: [UNFURNISHED, SEMI_FURNISHED, FURNISHED] }
 *       - in: query
 *         name: amenities
 *         description: |
 *           Filter by amenities — listing must contain **every** value provided
 *           (exact, case-sensitive match against stored values). Accepts either
 *           repeated keys (`?amenities=Gym&amenities=Parking`) or a single
 *           comma-separated string (`?amenities=Gym,Parking`).
 *         schema:
 *           oneOf:
 *             - type: string
 *               example: Gym,Parking
 *             - type: array
 *               items: { type: string }
 *         style: form
 *         explode: true
 *       - in: query
 *         name: isVerified
 *         schema: { type: string, enum: ['true'] }
 *         description: |
 *           Pass `true` to restrict results to verified listings. Any other
 *           value (or absent) returns both verified and unverified.
 *       - in: query
 *         name: postedWithin
 *         schema: { type: string, enum: ['24h', '7d', '30d'] }
 *         description: Only return listings whose `createdAt` falls inside the window.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_asc, price_desc, area_desc]
 *           default: newest
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 12 }
 *     responses:
 *       200: { description: Paginated list of properties }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', validate(listQuerySchema, 'query'), ctrl.list);

/**
 * @openapi
 * /api/properties/mine:
 *   get:
 *     tags: [Properties]
 *     summary: List properties owned by the current user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200: { description: Paginated list of user's properties }
 */
router.get('/mine', requireAuth, validate(listQuerySchema, 'query'), ctrl.listMine);

/**
 * @openapi
 * /api/properties/{idOrSlug}:
 *   get:
 *     tags: [Properties]
 *     summary: Get property detail by id or slug
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Property detail }
 *       404: { description: Not found }
 */
router.get('/:idOrSlug', ctrl.detail);

/**
 * @openapi
 * /api/properties/{idOrSlug}/similar:
 *   get:
 *     tags: [Properties]
 *     summary: Get similar property recommendations
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of similar properties }
 */
router.get('/:idOrSlug/similar', ctrl.similar);

/**
 * @openapi
 * /api/properties:
 *   post:
 *     tags: [Properties]
 *     summary: Create a new property listing
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PropertyInput' }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               payload: { type: string, description: "JSON-stringified PropertyInput" }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 */
router.post(
  '/',
  requireAuth,
  upload.array('images', 12),
  (req, res, next) => {
    // For JSON requests validate body; for multipart we trust the JSON payload field
    // (validated inside the controller via createSchema).
    if (req.is('multipart/form-data')) return next();
    return validate(createSchema)(req, res, next);
  },
  ctrl.create,
);

/**
 * @openapi
 * /api/properties/{id}:
 *   patch:
 *     tags: [Properties]
 *     summary: Update a property (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Not the owner }
 *   delete:
 *     tags: [Properties]
 *     summary: Delete a property (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       403: { description: Not the owner }
 */
router.patch(
  '/:id',
  requireAuth,
  upload.array('images', 12),
  (req, res, next) => {
    if (req.is('multipart/form-data')) return next();
    return validate(updateSchema)(req, res, next);
  },
  ctrl.update,
);

router.delete('/:id', requireAuth, ctrl.remove);

/**
 * @openapi
 * /api/properties/{id}/images:
 *   post:
 *     tags: [Properties]
 *     summary: Add images to a property (owner-only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Images attached }
 */
router.post('/:id/images', requireAuth, upload.array('images', 12), ctrl.addImages);

module.exports = router;
