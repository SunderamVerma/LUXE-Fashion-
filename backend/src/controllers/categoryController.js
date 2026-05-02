const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const buildUniqueSlug = require('../utils/buildUniqueSlug');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required.');
  }

  const slug = await buildUniqueSlug(Category, name);
  const category = await Category.create({ name, slug, description, image });

  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }

  const { name, description, image } = req.body;

  category.name = name || category.name;
  category.slug = name ? await buildUniqueSlug(Category, name, category._id) : category.slug;
  category.description = description ?? category.description;
  category.image = image ?? category.image;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }

  const linkedProducts = await Product.countDocuments({ category: category._id });
  if (linkedProducts > 0) {
    res.status(400);
    throw new Error('Remove or reassign products before deleting this category.');
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted.' });
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};