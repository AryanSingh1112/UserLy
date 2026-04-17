const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Self routes
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.get('/:id', protect, authorize('admin'), getUserById);
router.patch('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
