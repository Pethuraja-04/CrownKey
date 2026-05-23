const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { buildSlug } = require('../utils/slug');

const PUBLIC_FIELDS = {
  id: true,
  slug: true,
  title: true,
  description: true,
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
  address: true,
  latitude: true,
  longitude: true,
  amenities: true,
  status: true,
  isVerified: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, phone: true, email: true, role: true } },
  images: { select: { id: true, url: true, order: true, isPrimary: true }, orderBy: { order: 'asc' } },
};

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

const sortMap = {
  newest: [{ createdAt: 'desc' }],
  oldest: [{ createdAt: 'asc' }],
  price_asc: [{ price: 'asc' }, { createdAt: 'desc' }],
  price_desc: [{ price: 'desc' }, { createdAt: 'desc' }],
  area_desc: [{ areaSqft: 'desc' }, { createdAt: 'desc' }],
};

const POSTED_WITHIN_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const buildWhere = (q) => {
  const where = { status: 'ACTIVE' };

  if (q.city) where.city = { equals: q.city, mode: 'insensitive' };
  if (q.type) where.type = q.type;
  if (q.listingType) where.listingType = q.listingType;
  // PG/Hostel listings filter by occupancy (Single/Double/etc), not BHK.
  // For other property types, fall back to the bedrooms filter as before.
  if (q.type === 'PG' && q.roomType) {
    where.roomType = q.roomType;
  } else if (q.bedrooms !== undefined) {
    where.bedrooms = { gte: q.bedrooms };
  }
  if (q.bathrooms !== undefined) where.bathrooms = { gte: q.bathrooms };
  if (q.furnishing) where.furnishing = q.furnishing;
  if (q.isVerified === true) where.isVerified = true;

  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {};
    if (q.minPrice !== undefined) where.price.gte = q.minPrice;
    if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
  }

  if (q.minArea !== undefined || q.maxArea !== undefined) {
    where.areaSqft = {};
    if (q.minArea !== undefined) where.areaSqft.gte = q.minArea;
    if (q.maxArea !== undefined) where.areaSqft.lte = q.maxArea;
  }

  if (q.postedWithin && POSTED_WITHIN_MS[q.postedWithin]) {
    where.createdAt = { gte: new Date(Date.now() - POSTED_WITHIN_MS[q.postedWithin]) };
  }

  if (q.amenities?.length) {
    // Prisma `hasEvery` on a string[] column — uses GIN-friendly array containment.
    where.amenities = { hasEvery: q.amenities };
  }

  if (q.q) {
    // Pragmatic free-text on title/locality/city. For >50k rows the indexed
    // city/locality scan dominates; the title ILIKE narrows the candidate set.
    where.OR = [
      { title: { contains: q.q, mode: 'insensitive' } },
      { locality: { contains: q.q, mode: 'insensitive' } },
      { city: { contains: q.q, mode: 'insensitive' } },
    ];
  }

  return where;
};

const list = async (query) => {
  const where = buildWhere(query);
  const orderBy = sortMap[query.sort] || sortMap.newest;
  const skip = (query.page - 1) * query.limit;

  // Parallelize count + page query — both hit the same indexes.
  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: LIST_FIELDS,
    }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
      hasNext: skip + items.length < total,
      hasPrev: query.page > 1,
    },
  };
};

const getBySlugOrId = async (idOrSlug, { incrementView = false } = {}) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(idOrSlug);
  const property = await prisma.property.findUnique({
    where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    select: PUBLIC_FIELDS,
  });
  if (!property) throw AppError.notFound('Property not found');

  if (incrementView) {
    // fire-and-forget — don't block the response.
    prisma.property.update({ where: { id: property.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  }
  return property;
};

const create = async (ownerId, data) => {
  const { imageUrls, ...rest } = data;
  const slug = buildSlug(data.title);

  return prisma.property.create({
    data: {
      ...rest,
      slug,
      ownerId,
      images: imageUrls?.length
        ? {
            create: imageUrls.map((url, idx) => ({
              url,
              order: idx,
              isPrimary: idx === 0,
            })),
          }
        : undefined,
    },
    select: PUBLIC_FIELDS,
  });
};

const update = async (ownerId, id, data) => {
  const existing = await prisma.property.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing) throw AppError.notFound('Property not found');
  if (existing.ownerId !== ownerId) throw AppError.forbidden('You can only edit your own listings');

  const { imageUrls, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.property.update({
      where: { id },
      data: rest,
      select: PUBLIC_FIELDS,
    });

    if (imageUrls?.length) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      await tx.propertyImage.createMany({
        data: imageUrls.map((url, idx) => ({
          propertyId: id,
          url,
          order: idx,
          isPrimary: idx === 0,
        })),
      });
      const refreshed = await tx.property.findUnique({ where: { id }, select: PUBLIC_FIELDS });
      return refreshed;
    }

    return updated;
  });
};

const remove = async (ownerId, id) => {
  const existing = await prisma.property.findUnique({ where: { id }, select: { ownerId: true } });
  if (!existing) throw AppError.notFound('Property not found');
  if (existing.ownerId !== ownerId) throw AppError.forbidden('You can only delete your own listings');

  await prisma.property.delete({ where: { id } });
};

const addImages = async (ownerId, id, images) => {
  const existing = await prisma.property.findUnique({ where: { id }, select: { ownerId: true, _count: { select: { images: true } } } });
  if (!existing) throw AppError.notFound('Property not found');
  if (existing.ownerId !== ownerId) throw AppError.forbidden('You can only edit your own listings');

  const baseOrder = existing._count.images;
  const created = await prisma.$transaction(
    images.map((img, idx) =>
      prisma.propertyImage.create({
        data: {
          propertyId: id,
          url: img.url,
          order: baseOrder + idx,
          isPrimary: baseOrder === 0 && idx === 0,
        },
      }),
    ),
  );
  return created;
};

// Similarity heuristic: same city + same listingType + same type + bedroom
// within ±1, price within ±25%. Cheap because it leans on existing indexes.
const similar = async (idOrSlug, limit = 6) => {
  const target = await getBySlugOrId(idOrSlug);
  const priceLow = Number(target.price) * 0.75;
  const priceHigh = Number(target.price) * 1.25;

  return prisma.property.findMany({
    where: {
      id: { not: target.id },
      status: 'ACTIVE',
      city: target.city,
      type: target.type,
      listingType: target.listingType,
      bedrooms: { gte: Math.max(0, target.bedrooms - 1), lte: target.bedrooms + 1 },
      price: { gte: priceLow, lte: priceHigh },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
    select: LIST_FIELDS,
  });
};

const listOwned = async (ownerId, query) => {
  const skip = (query.page - 1) * query.limit;
  const where = { ownerId };
  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      select: { ...LIST_FIELDS, status: true, viewCount: true },
    }),
  ]);
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

module.exports = {
  list,
  getBySlugOrId,
  create,
  update,
  remove,
  addImages,
  similar,
  listOwned,
};
