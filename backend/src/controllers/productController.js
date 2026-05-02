const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const buildUniqueSlug = require('../utils/buildUniqueSlug');

function parseStringArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function parseColors(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    return JSON.parse(value);
  }
  return [];
}

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const search = req.query.search?.trim();
  const category = req.query.category?.trim();
  const subcategory = req.query.subcategory?.trim();
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  const sort = req.query.sort || 'createdAt-desc';

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { subcategory: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    const categoryDoc = await Category.findOne({ $or: [{ slug: category }, { name: new RegExp(`^${category}$`, 'i') }] });
    if (categoryDoc) query.category = categoryDoc._id;
  }

  if (subcategory) {
    query.subcategory = { $regex: `^${subcategory}$`, $options: 'i' };
  }

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    query.price = {};
    if (Number.isFinite(minPrice)) query.price.$gte = minPrice;
    if (Number.isFinite(maxPrice)) query.price.$lte = maxPrice;
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'rating-desc': { rating: -1 },
    'createdAt-desc': { createdAt: -1 },
    'createdAt-asc': { createdAt: 1 },
    featured: { isTrending: -1, isNew: -1, createdAt: -1 },
  };

  const [items, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.featured)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug description image');
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    description,
    category,
    subcategory,
    price,
    originalPrice,
    countInStock,
    sizes,
    colors,
    images,
    isNew,
    isTrending,
  } = req.body;

  if (!name || !brand || !description || !category || price == null) {
    res.status(400);
    throw new Error('Name, brand, description, category, and price are required.');
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    res.status(400);
    throw new Error('Invalid category.');
  }

  const product = await Product.create({
    name,
    slug: await buildUniqueSlug(Product, name),
    brand,
    description,
    category,
    subcategory,
    price,
    originalPrice: originalPrice || null,
    countInStock: countInStock || 0,
    sizes: parseStringArray(sizes),
    colors: parseColors(colors),
    images: parseStringArray(images),
    isNew: isNew === true || isNew === 'true',
    isTrending: isTrending === true || isTrending === 'true',
  });

  const populatedProduct = await product.populate('category', 'name slug');
  res.status(201).json(populatedProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const nextName = req.body.name || product.name;
  if (nextName !== product.name) {
    product.slug = await buildUniqueSlug(Product, nextName, product._id);
  }

  if (req.body.category) {
    const categoryDoc = await Category.findById(req.body.category);
    if (!categoryDoc) {
      res.status(400);
      throw new Error('Invalid category.');
    }
  }

  product.name = nextName;
  product.brand = req.body.brand ?? product.brand;
  product.description = req.body.description ?? product.description;
  product.category = req.body.category ?? product.category;
  product.subcategory = req.body.subcategory ?? product.subcategory;
  product.price = req.body.price ?? product.price;
  product.originalPrice = req.body.originalPrice ?? product.originalPrice;
  product.countInStock = req.body.countInStock ?? product.countInStock;
  product.sizes = req.body.sizes ? parseStringArray(req.body.sizes) : product.sizes;
  product.colors = req.body.colors ? parseColors(req.body.colors) : product.colors;
  product.images = req.body.images ? parseStringArray(req.body.images) : product.images;
  product.isNew = req.body.isNew != null ? req.body.isNew === true || req.body.isNew === 'true' : product.isNew;
  product.isTrending = req.body.isTrending != null ? req.body.isTrending === true || req.body.isTrending === 'true' : product.isTrending;

  const updatedProduct = await product.save();
  const populatedProduct = await updatedProduct.populate('category', 'name slug');
  res.json(populatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted.' });
});

const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Upload at least one image.');
  }

  const filePaths = req.files.map((file) => `/uploads/products/${file.filename}`);
  product.images = [...product.images, ...filePaths];
  await product.save();

  res.status(201).json({ images: product.images });
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
};