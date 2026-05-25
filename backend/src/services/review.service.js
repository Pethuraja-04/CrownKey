const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const add = async (userId, propertyId, { rating, comment }) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true }
  });

  if (!property) {
    throw AppError.notFound('Property not found');
  }

  if (property.ownerId === userId) {
    throw AppError.forbidden('Owners cannot review their own properties');
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      propertyId_userId: { propertyId, userId }
    }
  });

  if (existingReview) {
    throw AppError.badRequest('You have already reviewed this property');
  }

  return prisma.review.create({
    data: {
      userId,
      propertyId,
      rating: parseInt(rating, 10),
      comment
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const update = async (userId, reviewId, { rating, comment }) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw AppError.notFound('Review not found');
  }

  if (review.userId !== userId) {
    throw AppError.forbidden('You can only edit your own reviews');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: rating !== undefined ? parseInt(rating, 10) : undefined,
      comment
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const remove = async (userId, reviewId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw AppError.notFound('Review not found');
  }

  if (review.userId !== userId) {
    throw AppError.forbidden('You can only delete your own reviews');
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });
};

module.exports = {
  add,
  update,
  remove
};
