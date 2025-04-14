const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');
const upload = require('../config/documentUpload');

// Document Upload Routes
router.post('/upload', 
    protect,
    upload.single('document'),
    documentController.uploadDocument
);

router.post('/upload-multiple',
    protect,
    upload.fields([
        { name: 'ktp', maxCount: 1 },
        { name: 'passport', maxCount: 1 },
        { name: 'foto', maxCount: 1 },
        { name: 'vaksin', maxCount: 1 },
        { name: 'kk', maxCount: 1 },
        { name: 'buku_nikah', maxCount: 1 }
    ]),
    documentController.uploadMultipleDocuments
);

// Document Management Routes
router.get('/my-documents',
    protect,
    documentController.getMyDocuments
);

router.get('/:id',
    protect,
    documentController.getDocument
);

router.delete('/:id',
    protect,
    documentController.deleteDocument
);

// Admin Only Routes
router.get('/',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    documentController.getAllDocuments
);

router.patch('/:id/verify',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    documentController.verifyDocument
);

router.patch('/:id/reject',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    documentController.rejectDocument
);

module.exports = router; 