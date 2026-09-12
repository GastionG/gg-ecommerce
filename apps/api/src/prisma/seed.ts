import * as bcrypt from 'bcrypt';
import { db } from './db';

const ADMIN_EMAIL = 'admin@gg.local';
const ADMIN_PASSWORD = 'admin12345';

const CATEGORIES = [
  { slug: 'keyboards', name: 'Keyboards' },
  { slug: 'mice', name: 'Mice' },
  { slug: 'headsets', name: 'Headsets' },
] as const;

const PRODUCTS = [
  {
    slug: 'apex-pro-tkl',
    name: 'Apex Pro TKL',
    description:
      'Tenkeyless mechanical keyboard with adjustable actuation and a compact aluminum frame.',
    priceCents: 15999,
    stock: 14,
    categorySlug: 'keyboards',
  },
  {
    slug: 'nightshade-75',
    name: 'Nightshade 75',
    description:
      '75% gasket-mount board with hot-swap switches, south-facing LEDs, and a screwless case.',
    priceCents: 12999,
    stock: 8,
    categorySlug: 'keyboards',
  },
  {
    slug: 'clickforge-108',
    name: 'ClickForge 108',
    description:
      'Full-size clicky keyboard with PBT keycaps and dedicated media controls for desk setups.',
    priceCents: 8999,
    stock: 21,
    categorySlug: 'keyboards',
  },
  {
    slug: 'macropad-12',
    name: 'Macro Pad 12',
    description:
      'Programmable 12-key pad with rotary encoder for stream decks, editing, and macros.',
    priceCents: 4499,
    stock: 30,
    categorySlug: 'keyboards',
  },
  {
    slug: 'vector-wireless',
    name: 'Vector Wireless',
    description:
      'Lightweight wireless gaming mouse with a 26K sensor and 80-hour battery life.',
    priceCents: 7999,
    stock: 18,
    categorySlug: 'mice',
  },
  {
    slug: 'orbit-ergonomic',
    name: 'Orbit Ergonomic',
    description:
      'Vertical wireless mouse shaped to keep your wrist neutral during long sessions.',
    priceCents: 6499,
    stock: 11,
    categorySlug: 'mice',
  },
  {
    slug: 'pulse-mini',
    name: 'Pulse Mini',
    description:
      'Ultra-light 58g mouse for fast FPS aim. Currently awaiting a restock.',
    priceCents: 3999,
    stock: 0,
    categorySlug: 'mice',
  },
  {
    slug: 'sentinel-8k',
    name: 'Sentinel 8K',
    description:
      'Wired 8K polling mouse with PTFE skates and a flexible paracord-style cable.',
    priceCents: 9999,
    stock: 6,
    categorySlug: 'mice',
  },
  {
    slug: 'halo-surround',
    name: 'Halo Surround',
    description:
      'Closed-back headset with virtual surround, a flip-to-mute mic, and memory-foam cups.',
    priceCents: 11999,
    stock: 16,
    categorySlug: 'headsets',
  },
  {
    slug: 'drift-wireless',
    name: 'Drift Wireless',
    description:
      'Low-latency wireless headset with 40mm drivers and a 24-hour battery.',
    priceCents: 14999,
    stock: 9,
    categorySlug: 'headsets',
  },
  {
    slug: 'studio-lite',
    name: 'Studio Lite',
    description:
      'Lightweight wired headset for everyday play, calls, and travel.',
    priceCents: 5999,
    stock: 25,
    categorySlug: 'headsets',
  },
  {
    slug: 'comms-boom',
    name: 'Comms Boom',
    description:
      'Broadcast-style boom mic headset built for clear voice chat and long streams.',
    priceCents: 8999,
    stock: 13,
    categorySlug: 'headsets',
  },
] as const;

function imageUrlFor(slug: string): string {
  return `https://picsum.photos/seed/${slug}/800/600`;
}

async function seed() {
  const categoriesBySlug = new Map<string, { id: number }>();

  for (const category of CATEGORIES) {
    const saved = await db.orm.public.Category.upsert({
      create: category,
      update: { name: category.name },
    });
    categoriesBySlug.set(category.slug, saved);
    console.log(`Category ${saved.slug} (#${saved.id})`);
  }

  for (const product of PRODUCTS) {
    const category = categoriesBySlug.get(product.categorySlug);
    if (!category) {
      throw new Error(`Missing category ${product.categorySlug}`);
    }

    const saved = await db.orm.public.Product.upsert({
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        imageUrl: imageUrlFor(product.slug),
        stock: product.stock,
        categoryId: category.id,
      },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        imageUrl: imageUrlFor(product.slug),
        stock: product.stock,
        categoryId: category.id,
      },
    });
    console.log(`Product ${saved.slug} (#${saved.id})`);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await db.orm.public.User.upsert({
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
    },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin ${admin.email} (#${admin.id})`);

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products, and 1 admin.`,
  );
}

try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await db.runtime().close();
}
