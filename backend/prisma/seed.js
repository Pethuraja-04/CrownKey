/**
 * Seed script — generates realistic property data for performance testing.
 *
 *   node prisma/seed.js                # ~5,000 properties (fast)
 *   node prisma/seed.js --count=50000  # full 50k load for scalability demo
 *   node prisma/seed.js --reset        # wipe before seeding
 */

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const crypto = require('crypto');

const prisma = new PrismaClient();

const argv = process.argv.slice(2).reduce((acc, a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) acc[m[1]] = m[2] ?? true;
  return acc;
}, {});

const COUNT = parseInt(argv.count || '5000', 10);
const RESET = !!argv.reset;
const BATCH = 1000;

const CITIES = [
  { city: 'Mumbai', localities: ['Bandra West', 'Andheri East', 'Powai', 'Worli', 'Juhu', 'Lower Parel', 'Malad', 'Goregaon'] },
  { city: 'Bengaluru', localities: ['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'Jayanagar', 'JP Nagar', 'Marathahalli', 'Hebbal'] },
  { city: 'Delhi', localities: ['Saket', 'Dwarka', 'Vasant Kunj', 'Rohini', 'Hauz Khas', 'Karol Bagh', 'Pitampura', 'Greater Kailash'] },
  { city: 'Gurgaon', localities: ['DLF Phase 2', 'Sector 56', 'Golf Course Road', 'Sohna Road', 'Sector 49', 'MG Road'] },
  { city: 'Pune', localities: ['Koregaon Park', 'Hinjewadi', 'Baner', 'Viman Nagar', 'Kothrud', 'Wakad', 'Aundh'] },
  { city: 'Hyderabad', localities: ['Gachibowli', 'Madhapur', 'Banjara Hills', 'Kondapur', 'Jubilee Hills', 'Hitech City'] },
  { city: 'Chennai', localities: ['Adyar', 'T Nagar', 'Velachery', 'OMR', 'Anna Nagar', 'Besant Nagar'] },
  { city: 'Kolkata', localities: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Howrah'] },
  { city: 'Noida', localities: ['Sector 62', 'Sector 18', 'Sector 137', 'Greater Noida West'] },
  { city: 'Ahmedabad', localities: ['Satellite', 'Bopal', 'SG Highway', 'Vastrapur'] },
];

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const LISTING_TYPES = ['SALE', 'RENT'];
const FURNISHING = ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'];
const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY'];
const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Lift', '24x7 Security', 'Power Backup',
  'Clubhouse', 'Garden', 'Kids Play Area', 'Jogging Track', 'CCTV', 'Intercom',
  'Vastu Compliant', 'Visitor Parking', 'Rainwater Harvesting', 'Maintenance Staff',
  'Fire Safety', 'Indoor Games',
];
const IMAGE_BUCKET = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

const buildSlug = (title) => {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 80);
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
};

const formatINR = (n) => {
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString('en-IN')}`;
};

async function ensureUsers(n = 50) {
  const existing = await prisma.user.count();
  if (existing >= n) return prisma.user.findMany({ select: { id: true }, take: n });

  const password = await bcrypt.hash('Password123!', 10);
  const users = [];
  // Demo user with known creds.
  const demo = await prisma.user.upsert({
    where: { email: 'demo@realestate.dev' },
    update: {},
    create: {
      email: 'demo@realestate.dev',
      name: 'Demo Owner',
      passwordHash: password,
      phone: '+91 90000 00000',
      role: 'AGENT',
    },
  });
  users.push({ id: demo.id });

  const toCreate = [];
  for (let i = existing; i < n; i++) {
    toCreate.push({
      email: faker.internet.email({ provider: 'realestate.dev' }).toLowerCase(),
      name: faker.person.fullName(),
      passwordHash: password,
      phone: faker.phone.number(),
      role: i % 4 === 0 ? 'AGENT' : 'USER',
    });
  }
  await prisma.user.createMany({ data: toCreate, skipDuplicates: true });
  const all = await prisma.user.findMany({ select: { id: true }, take: n });
  return all;
}

async function reset() {
  console.log('Wiping existing data…');
  await prisma.inquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log(`Seeding ${COUNT} properties…`);
  if (RESET) await reset();

  const users = await ensureUsers(Math.max(50, Math.floor(COUNT / 200)));
  console.log(`Users ready: ${users.length}`);

  let inserted = 0;
  const t0 = Date.now();

  while (inserted < COUNT) {
    const batchSize = Math.min(BATCH, COUNT - inserted);
    const propertyRows = [];
    const titlesForImages = [];

    for (let i = 0; i < batchSize; i++) {
      const cityRow = pick(CITIES);
      const locality = pick(cityRow.localities);
      const type = pick(PROPERTY_TYPES);
      // PGs are rent-only in the real world; everything else can be either.
      const listingType = type === 'PG' ? 'RENT' : pick(LISTING_TYPES);
      const isPg = type === 'PG';
      const noBhk = type === 'PLOT' || type === 'COMMERCIAL' || isPg;
      const bedrooms = noBhk ? 0 : faker.number.int({ min: 1, max: 5 });
      const roomType = isPg ? pick(ROOM_TYPES) : null;
      const areaSqft = type === 'PLOT'
        ? faker.number.int({ min: 800, max: 8000 })
        : isPg
          ? faker.number.int({ min: 80, max: 300 })
          : faker.number.int({ min: 450, max: 4500 });
      // Realistic prices — sale: ₹40L–₹15Cr; rent: ₹10k–₹2.5L/mo; PG: ₹4k–₹25k/mo.
      const price = listingType === 'SALE'
        ? faker.number.int({ min: 4000000, max: 150000000 })
        : isPg
          ? faker.number.int({ min: 4000, max: 25000 })
          : faker.number.int({ min: 10000, max: 250000 });

      const roomLabel = roomType ? `${roomType[0] + roomType.slice(1).toLowerCase()} occupancy ` : '';
      const title = isPg
        ? `${roomLabel}PG for rent in ${locality}, ${cityRow.city}`
        : `${bedrooms ? `${bedrooms} BHK ` : ''}${type[0] + type.slice(1).toLowerCase()} ${listingType === 'SALE' ? 'for sale' : 'for rent'} in ${locality}, ${cityRow.city}`;
      const slug = buildSlug(title);
      const amenities = pickMany(AMENITIES, faker.number.int({ min: 3, max: 9 }));
      const ownerId = pick(users).id;

      propertyRows.push({
        slug,
        title,
        description: `${faker.lorem.paragraph()} Located in ${locality}, ${cityRow.city}. Spread across ${areaSqft} sq.ft. Priced at ${formatINR(price)}${listingType === 'RENT' ? '/month' : ''}. ${faker.lorem.sentence()}`,
        price,
        type,
        listingType,
        bedrooms,
        bathrooms: bedrooms ? Math.max(1, bedrooms - faker.number.int({ min: 0, max: 1 })) : isPg ? 1 : 0,
        areaSqft,
        furnishing: isPg ? 'FURNISHED' : pick(FURNISHING),
        roomType,
        city: cityRow.city,
        locality,
        address: `${faker.location.streetAddress()}, ${locality}, ${cityRow.city}`,
        latitude: parseFloat(faker.location.latitude({ min: 8, max: 35 })),
        longitude: parseFloat(faker.location.longitude({ min: 68, max: 97 })),
        amenities,
        status: 'ACTIVE',
        isVerified: Math.random() > 0.6,
        viewCount: faker.number.int({ min: 0, max: 5000 }),
        ownerId,
      });
      titlesForImages.push(slug);
    }

    await prisma.property.createMany({ data: propertyRows, skipDuplicates: true });

    // Attach 3-5 images per property in bulk.
    const created = await prisma.property.findMany({
      where: { slug: { in: titlesForImages } },
      select: { id: true },
    });
    const imageRows = [];
    for (const p of created) {
      const count = faker.number.int({ min: 3, max: 5 });
      const chosen = pickMany(IMAGE_BUCKET, count);
      for (let i = 0; i < chosen.length; i++) {
        imageRows.push({
          propertyId: p.id,
          url: `${chosen[i]}?auto=format&fit=crop&w=1200&q=70&sig=${faker.number.int({ min: 1, max: 99999 })}`,
          order: i,
          isPrimary: i === 0,
        });
      }
    }
    if (imageRows.length) await prisma.propertyImage.createMany({ data: imageRows });

    inserted += batchSize;
    const rate = Math.round(inserted / ((Date.now() - t0) / 1000));
    process.stdout.write(`\r  inserted ${inserted}/${COUNT}  (${rate} rows/s)`);
  }

  process.stdout.write('\n');
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
  console.log(`\nDemo login → email: demo@realestate.dev  password: Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
