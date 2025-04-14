const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.me);
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

// User management routes
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

// Admin only routes
router.get('/users', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    authController.getAllUsers
);

router.get('/users/:id', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    authController.getUserById
);

router.put('/users/:id', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    authController.updateUser
);

module.exports = router; 