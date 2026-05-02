const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized. Missing token.');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('User for this token no longer exists.');
  }

  req.user = user;
  next();
});

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required.');
  }

  next();
}

module.exports = {
  protect,
  adminOnly,
};