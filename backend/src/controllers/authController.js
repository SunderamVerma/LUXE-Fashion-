const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  addresses: Array.isArray(user.addresses) ? user.addresses : [],
  role: user.role,
  avatar: user.avatar,
  cart: user.cart || [],
  wishlist: user.wishlist || [],
  storeSettings: user.storeSettings || {
    storeName: 'LUXE Fashion',
    contactEmail: 'admin@luxe.com',
    currency: 'USD',
  },
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('Register request received:', { name, email, role });

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  // Validate role - only allow 'admin' or 'customer'
  const validRole = (role === 'admin' || role === 'customer') ? role : 'customer';
  console.log('Validated role:', validRole);

  const user = await User.create({
    name,
    email,
    password,
    role: validRole,
  });

  console.log('User created:', { userId: user._id, email: user.email, role: user.role });

  res.status(201).json({
    ...buildUserPayload(user),
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email });

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  console.log('User authenticated:', { userId: user._id, email: user.email, role: user.role });

  res.json({
    ...buildUserPayload(user),
    token: generateToken(user._id),
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(buildUserPayload(req.user));
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  user.phone = req.body.phone ?? user.phone;
  user.addresses = Array.isArray(req.body.addresses) ? req.body.addresses : user.addresses;
  user.avatar = req.body.avatar ?? user.avatar;
  user.cart = Array.isArray(req.body.cart) ? req.body.cart : user.cart;
  user.wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist : user.wishlist;
  user.storeSettings = req.body.storeSettings ? { ...user.storeSettings, ...req.body.storeSettings } : user.storeSettings;

  const updatedUser = await user.save();
  res.json(buildUserPayload(updatedUser));
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
};