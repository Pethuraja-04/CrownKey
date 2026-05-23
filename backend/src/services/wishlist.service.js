const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

// Mirrors the trimmed LIST_FIELDS used by property.service so the wishlist
// page can render PropertyCard-shaped objects without a second round-trip.
const LIST_FIELDS = {
  id: true,
  slug: true,
  title: true,
  price: true,
  type: true,
  listingType: true,
  bedrooms: true,
  bathrooms: true,
  areaSqft: true,
  furnishing: true,
  roomType: true,
  city: true,
  locality: true,
  isVerified: true,
  createdAt: true,
  images: {
    select: { url: true, isPrimary: true, order: true },
    orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
    take: 1,
  },
};

const add = async (userId, propertyId) => {
  // Confirm the property exists & is not soft-removed before saving the relation.
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, status: true },
  });
  if (!property) throw AppError.notFound('Property not found');

  // upsert keeps this idempotent — duplicate POST returns 200 without erroring.
  const item = await prisma.wishlistItem.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    update: {},
    create: { userId, propertyId },
    select: { id: true, propertyId: true, createdAt: true },
  });
  return item;
};

const remove = async (userId, propertyId) => {
  // deleteMany over delete-by-unique so a missing row doesn't throw P2025 —
  // removing something that isn't there is a no-op, not an error.
  await prisma.wishlistItem.deleteMany({
    where: { userId, propertyId },
  });
};

const list = async (userId, { page = 1, limit = 12 } = {}) => {
  const skip = (page - 1) * limit;
  const where = { userId };

  const [total, rows] = await Promise.all([
    prisma.wishlistItem.count({ where }),
    prisma.wishlistItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        property: { select: LIST_FIELDS },
      },
    }),
  ]);

  return {
    items: rows.map((r) => ({
      wishlistId: r.id,
      addedAt: r.createdAt,
      ...r.property,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + rows.length < total,
      hasPrev: page > 1,
    },
  };
};

// Cheap endpoint for hydrating the client-side "is this in my wishlist" Set
// without paying the cost of returning property payloads.
const listIds = async (userId) => {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return rows.map((r) => r.propertyId);
};

module.exports = { add, remove, list, listIds };
