const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');

const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../../.env') });

function extractJson(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Unable to parse section between markers: ${startMarker} / ${endMarker}`);
  }

  const jsonText = source
    .slice(start + startMarker.length, end)
    .trim()
    .replace(/;\s*$/, '');
  return JSON.parse(jsonText);
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured.');
  }

  const sourcePath = path.join(__dirname, '../../../src/data/products.js');
  const source = fs.readFileSync(sourcePath, 'utf8');

  const products = extractJson(source, 'const PRODUCTS = ', '\n\nexport const CATEGORIES =');
  const categories = extractJson(source, 'export const CATEGORIES = ', '\n\nexport const COLLECTIONS =');

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  if (process.argv.includes('--reset')) {
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Existing products/categories deleted');
  }

  const categoryMap = new Map();
  for (const category of categories) {
    const upserted = await Category.findOneAndUpdate(
      { slug: category.id },
      {
        name: category.name,
        slug: category.id,
        image: category.image || '',
        description: `${category.name} collection`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryMap.set(category.id, upserted._id);
  }

  const docs = products
    .filter((product) => categoryMap.has(product.category))
    .map((product) => ({
      name: product.name,
      slug: slugify(`${product.name}-${product.id}`, { lower: true, strict: true, trim: true }),
      brand: product.brand,
      description: product.description,
      category: categoryMap.get(product.category),
      subcategory: product.subcategory,
      price: Number(product.price) || 0,
      originalPrice: Number(product.originalPrice) || null,
      countInStock: 20,
      images: Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean),
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      isNew: !!product.isNew,
      isTrending: !!product.isTrending,
      rating: Number(product.rating) || 0,
      numReviews: Number(product.reviews) || 0,
    }));

  if (docs.length) {
    await Product.insertMany(docs, { ordered: false });
  }

  console.log(`Seeded ${docs.length} products and ${categories.length} categories`);
  await mongoose.disconnect();
}

seed()
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
