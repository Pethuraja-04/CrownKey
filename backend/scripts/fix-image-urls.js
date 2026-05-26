/**
 * fix-image-urls.js
 *
 * One-time script: rewrites all PropertyImage URLs that point to
 * http://localhost:4000/uploads/… so they point to the production
 * backend URL instead.
 *
 * Usage (run locally with the production DATABASE_URL in your .env):
 *   node scripts/fix-image-urls.js
 *
 * Or override inline:
 *   DATABASE_URL="postgresql://..." node scripts/fix-image-urls.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const OLD_PREFIX = 'http://localhost:4000/uploads/';
const NEW_PREFIX = 'https://crownkey.onrender.com/uploads/';

async function main() {
  const prisma = new PrismaClient();

  try {
    // Find all images with the old localhost prefix
    const bad = await prisma.propertyImage.findMany({
      where: { url: { startsWith: OLD_PREFIX } },
      select: { id: true, url: true },
    });

    if (bad.length === 0) {
      console.log('✅  No localhost URLs found — nothing to migrate.');
      return;
    }

    console.log(`Found ${bad.length} image(s) with localhost URLs. Migrating…`);

    // Bulk-update each one
    const results = await Promise.all(
      bad.map((img) =>
        prisma.propertyImage.update({
          where: { id: img.id },
          data: { url: img.url.replace(OLD_PREFIX, NEW_PREFIX) },
        })
      )
    );

    console.log(`✅  Migrated ${results.length} image URL(s):`);
    results.forEach((r) => console.log(`   ${r.id} → ${r.url}`));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
