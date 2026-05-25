const swaggerJsdoc = require('swagger-jsdoc');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Estatery — Real Estate Listing API',
      version: '1.1.0',
      description: [
        'REST API powering the Estatery real-estate platform.',
        '',
        '**Capabilities**',
        '- JWT auth (access + refresh tokens) with `/api/auth/*` endpoints',
        '- Property CRUD with multipart image uploads and slug-based detail URLs',
        '- Indexed search & filter: city, type, listing type, BHK / room type, bathrooms, price range, area range, furnishing, amenities (multi-select), verified-only toggle, and recency window',
        '- Owner-scoped inquiries with per-property dedupe and spam rate-limiting',
        '- Per-user wishlist (save / unsave / list / id-hydration)',
        '- Property reviews & star ratings — one review per user per property, with edit and delete',
        '- Groq-backed AI concierge restricted to real-estate topics',
      ].join('\n'),
    },
    servers: [{ url: env.publicBaseUrl, description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        PropertyInput: {
          type: 'object',
          required: ['title', 'description', 'price', 'type', 'listingType', 'areaSqft', 'city', 'locality', 'address'],
          properties: {
            title: { type: 'string', example: '3 BHK Sea-facing Apartment in Bandra West' },
            description: { type: 'string' },
            price: { type: 'number', example: 35000000 },
            type: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'] },
            listingType: { type: 'string', enum: ['SALE', 'RENT'] },
            bedrooms: { type: 'integer', example: 3 },
            bathrooms: { type: 'integer', example: 3 },
            areaSqft: { type: 'integer', example: 1450 },
            furnishing: { type: 'string', enum: ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'] },
            roomType: {
              type: 'string',
              enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY'],
              description: 'Occupancy type — required when type=PG, ignored otherwise',
            },
            city: { type: 'string', example: 'Mumbai' },
            locality: { type: 'string', example: 'Bandra West' },
            address: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            amenities: { type: 'array', items: { type: 'string' } },
            imageUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
          },
        },
        Property: {
          allOf: [
            { $ref: '#/components/schemas/PropertyInput' },
            {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                slug: { type: 'string' },
                status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'] },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
            comment: { type: 'string', example: 'Great property with excellent connectivity.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'Aarav Sharma' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: {},
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
