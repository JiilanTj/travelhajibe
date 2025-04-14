const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commission.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Agen routes
router.get('/my-commissions', 
    protect, 
    restrictTo('AGEN'), 
    commissionController.getMyCommissions
);

router.get('/my-stats', 
    protect, 
    restrictTo('AGEN'), 
    commissionController.getMyStats
);

// Admin routes
router.get('/', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    commissionController.getAllCommissions
);

router.patch('/:id/approve', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    commissionController.approveCommission
);

router.patch('/:id/pay', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    commissionController.payCommission
);

module.exports = router; 