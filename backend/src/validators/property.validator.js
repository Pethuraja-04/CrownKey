const { z } = require('zod');

const propertyTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const listingTypes = ['SALE', 'RENT'];
const furnishings = ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'];
const statuses = ['ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'];
const roomTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY'];

const createSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  price: z.coerce.number().positive().max(1e12),
  type: z.enum(propertyTypes),
  listingType: z.enum(listingTypes),
  bedrooms: z.coerce.number().int().min(0).max(20).default(0),
  bathrooms: z.coerce.number().int().min(0).max(20).default(0),
  areaSqft: z.coerce.number().int().positive().max(1_000_000),
  furnishing: z.enum(furnishings).default('UNFURNISHED'),
  // Only required/meaningful for type=PG.
  roomType: z.enum(roomTypes).nullish(),
  city: z.string().min(2).max(80),
  locality: z.string().min(2).max(120),
  address: z.string().min(5).max(300),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  amenities: z.array(z.string().max(50)).max(40).default([]),
  imageUrls: z.array(z.string().url()).max(15).optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(statuses).optional(),
});

const listQuerySchema = z.object({
  q: z.string().max(120).optional(),
  city: z.string().max(80).optional(),
  type: z.enum(propertyTypes).optional(),
  listingType: z.enum(listingTypes).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  roomType: z.enum(roomTypes).optional(),
  minArea: z.coerce.number().int().nonnegative().optional(),
  maxArea: z.coerce.number().int().nonnegative().optional(),
  furnishing: z.enum(furnishings).optional(),
  amenities: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : v.split(',').map((s) => s.trim()).filter(Boolean)))
    .optional(),
  // Truthy-string → boolean. Only `true` triggers the filter; anything else
  // (absent, "false", "0") leaves verified+unverified both visible.
  isVerified: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => (v === true || v === 'true' || v === '1' ? true : undefined)),
  postedWithin: z.enum(['24h', '7d', '30d']).optional(),
  sort: z
    .enum(['newest', 'oldest', 'price_asc', 'price_desc', 'area_desc'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

module.exports = {
  createSchema,
  updateSchema,
  listQuerySchema,
  propertyTypes,
  listingTypes,
  furnishings,
  statuses,
  roomTypes,
};
