const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

// Sliding-window dedup for guest inquiries (no userId yet).
// Same email + same propertyId within 24h → reject as duplicate.
const GUEST_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

const create = async ({ user, ip, payload }) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
    select: { id: true, ownerId: true, status: true },
  });
  if (!property) throw AppError.notFound('Property not found');
  if (property.status !== 'ACTIVE') throw AppError.badRequest('This listing is not accepting inquiries');
  if (user && user.id === property.ownerId) {
    throw AppError.badRequest('You cannot inquire on your own listing');
  }

  // Logged-in users get a real unique constraint on (propertyId, userId).
  if (user) {
    const existing = await prisma.inquiry.findUnique({
      where: { propertyId_userId: { propertyId: property.id, userId: user.id } },
    });
    if (existing) throw AppError.conflict('You have already inquired about this property');
  } else {
    // Guests: time-window dedup on (propertyId, email).
    const since = new Date(Date.now() - GUEST_DEDUP_WINDOW_MS);
    const dup = await prisma.inquiry.findFirst({
      where: {
        propertyId: property.id,
        email: payload.email,
        createdAt: { gte: since },
      },
    });
    if (dup) throw AppError.conflict('A duplicate inquiry was already submitted recently');
  }

  return prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId: user?.id ?? null,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      ipAddress: ip,
    },
    select: {
      id: true,
      propertyId: true,
      name: true,
      email: true,
      phone: true,
      message: true,
      createdAt: true,
    },
  });
};

// Inquiries received on the current user's listings.
const listReceived = async (ownerId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const where = { property: { ownerId } };
  const [total, items] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        createdAt: true,
        property: { select: { id: true, slug: true, title: true, city: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

module.exports = { create, listReceived };
