/**
 * migrate-to-cloudinary.js
 *
 * Uploads all local images from the uploads/ directory to Cloudinary,
 * then updates the corresponding PropertyImage rows in the database
 * with the new Cloudinary URLs.
 *
 * Prerequisites:
 *   - Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 *   - Ensure DATABASE_URL points to the correct database
 *
 * Usage:
 *   node scripts/migrate-to-cloudinary.js
 */

require('dotenv').config();
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');

const RENDER_PREFIX = 'https://crownkey.onrender.com/uploads/';
const LOCAL_PREFIX = 'http://localhost:4000/uploads/';
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

async function main() {
  // --- Validate Cloudinary credentials ---
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('❌  Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const prisma = new PrismaClient();

  try {
    // Find all images that are still pointing at Render/localhost uploads
    const images = await prisma.propertyImage.findMany({
      where: {
        OR: [
          { url: { startsWith: RENDER_PREFIX } },
          { url: { startsWith: LOCAL_PREFIX } },
        ],
      },
      select: { id: true, url: true },
    });

    if (images.length === 0) {
      console.log('✅  No local/Render upload URLs found — nothing to migrate.');
      return;
    }

    console.log(`Found ${images.length} image(s) to migrate to Cloudinary.\n`);

    let success = 0;
    let failed = 0;

    for (const img of images) {
      // Extract filename from URL
      const filename = img.url.split('/uploads/')[1];
      if (!filename) {
        console.log(`⚠️  Skipping ${img.id}: could not extract filename from ${img.url}`);
        failed++;
        continue;
      }

      const localPath = path.join(UPLOADS_DIR, filename);

      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'crownkey/properties',
          resource_type: 'image',
          // Use the original filename (without extension) as the public_id
          public_id: path.parse(filename).name,
        });

        // Update DB row with Cloudinary URL
        await prisma.propertyImage.update({
          where: { id: img.id },
          data: { url: result.secure_url },
        });

        console.log(`✅  ${filename} → ${result.secure_url}`);
        success++;
      } catch (err) {
        console.error(`❌  Failed to migrate ${filename}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n--- Done ---`);
    console.log(`✅  Migrated: ${success}`);
    if (failed > 0) console.log(`❌  Failed:   ${failed}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
