const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Blog Category Routes
// Public routes
router.get('/categories', blogController.getAllCategories);

// Protected routes (ADMIN & SUPERADMIN only)
router.post('/categories',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    blogController.createCategory
);

// Blog Post Routes
// Public routes
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:id', blogController.getPost);

// Protected routes (ADMIN & SUPERADMIN only)
router.post('/posts',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    blogController.uploadBlogImage.single('featuredImage'),
    blogController.handleBlogUploadError,
    blogController.createPost
);

router.put('/posts/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    blogController.uploadBlogImage.single('featuredImage'),
    blogController.handleBlogUploadError,
    blogController.updatePost
);

router.delete('/posts/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    blogController.deletePost
);

// Get blog statistics
router.get('/stats', protect, restrictTo('ADMIN', 'SUPERADMIN'), blogController.getBlogStats);

module.exports = router; 