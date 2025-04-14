const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');
const { upload, handleMulterError } = require('../config/multer');

// Setup multer untuk multiple upload
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]);

// Public routes
router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackage);

// Protected routes (ADMIN & SUPERADMIN only)
router.post('/', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'),
    uploadFields, 
    handleMulterError, 
    packageController.createPackage
);

router.put('/:id', 
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    uploadFields, 
    handleMulterError, 
    packageController.updatePackage
);

router.delete('/:id', 
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    packageController.deletePackage
);

module.exports = router; 