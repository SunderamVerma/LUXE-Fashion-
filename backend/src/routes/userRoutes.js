const express = require('express');
const { listUsers, updateUserRole } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, listUsers);
router.patch('/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;