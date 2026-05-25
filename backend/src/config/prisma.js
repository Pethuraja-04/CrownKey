const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    ...(process.env.NODE_ENV === 'development' ? ['warn'] : []),
  ],
});

prisma.$on('error', (e) => {
  // Neon's free tier aggressively drops idle connections, which causes Prisma to log this error.
  // Prisma automatically recovers and reconnects for the next query, so we can safely ignore the log spam.
  if (e.message && e.message.includes('kind: Closed, cause: None')) {
    return;
  }
  console.error(`prisma:error ${e.message}`);
});

module.exports = prisma;
