const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function connect() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured.');
  }
  await mongoose.connect(process.env.MONGO_URI);
}

function buildShipping(user) {
  const nameParts = String(user.name || 'Demo User').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Demo';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  return {
    firstName,
    lastName,
    email: user.email,
    phone: '9999999999',
    street: '123 Demo Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India',
  };
}

async function upsertUsers() {
  const admin = await User.findOneAndUpdate(
    { email: 'admin@demo.com' },
    {
      name: 'Demo Admin',
      email: 'admin@demo.com',
      role: 'admin',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!admin.password || process.argv.includes('--reset-passwords')) {
    admin.password = 'admin123';
    await admin.save();
  }

  const customer = await User.findOneAndUpdate(
    { email: 'user@demo.com' },
    {
      name: 'Demo User',
      email: 'user@demo.com',
      role: 'customer',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!customer.password || process.argv.includes('--reset-passwords')) {
    customer.password = 'user123';
    await customer.save();
  }

  return { admin, customer };
}

async function ensureCatalog() {
  const categoryCount = await Category.countDocuments();
  const productCount = await Product.countDocuments();

  if (categoryCount > 0 && productCount > 0) {
    return;
  }

  const women = await Category.findOneAndUpdate(
    { slug: 'women' },
    { name: 'Women', slug: 'women', description: 'Women collection' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const men = await Category.findOneAndUpdate(
    { slug: 'men' },
    { name: 'Men', slug: 'men', description: 'Men collection' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (productCount === 0) {
    await Product.insertMany([
      {
        name: 'Demo Leather Jacket',
        slug: 'demo-leather-jacket',
        brand: 'LUXE Originals',
        description: 'Demo product for presentations.',
        category: women._id,
        subcategory: 'jackets',
        price: 8999,
        originalPrice: 10999,
        countInStock: 25,
        images: ['https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&h=800&fit=crop'],
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Black', hex: '#111111' }],
        isNew: true,
        isTrending: true,
        rating: 4.6,
        numReviews: 42,
      },
      {
        name: 'Demo Tailored Blazer',
        slug: 'demo-tailored-blazer',
        brand: 'LUXE Originals',
        description: 'Demo product for admin and checkout flow.',
        category: men._id,
        subcategory: 'blazers',
        price: 7499,
        originalPrice: 8999,
        countInStock: 30,
        images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=800&fit=crop'],
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Navy', hex: '#1d3557' }],
        isNew: false,
        isTrending: true,
        rating: 4.4,
        numReviews: 31,
      },
    ]);
  }
}

async function seedOrders(customer) {
  const existing = await Order.countDocuments({ user: customer._id });
  if (existing > 0 && !process.argv.includes('--reset-orders')) {
    return 0;
  }

  if (process.argv.includes('--reset-orders')) {
    await Order.deleteMany({ user: customer._id });
  }

  const products = await Product.find().limit(2);
  if (products.length === 0) {
    return 0;
  }

  const orderItems = products.map((product, index) => ({
    product: product._id,
    name: product.name,
    image: Array.isArray(product.images) ? product.images[0] || '' : '',
    price: product.price,
    quantity: index + 1,
    size: (product.sizes && product.sizes[0]) || 'M',
    color: (product.colors && product.colors[0] && product.colors[0].name) || '',
  }));

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxPrice = Math.round(itemsPrice * 0.08);
  const shippingPrice = itemsPrice > 2000 ? 0 : 199;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  await Order.create({
    user: customer._id,
    orderItems,
    shippingAddress: buildShipping(customer),
    paymentMethod: 'cod',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: 'Processing',
  });

  return 1;
}

async function run() {
  await connect();

  await ensureCatalog();
  const { admin, customer } = await upsertUsers();
  const createdOrders = await seedOrders(customer);

  console.log('Demo seed completed');
  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Customer: ${customer.email} / user123`);
  console.log(`Orders created this run: ${createdOrders}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Demo seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
