const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// User routes
router.get('/info/:registrationId', 
    protect, 
    paymentController.getPaymentInfo
);

router.get('/my-payments', 
    protect, 
    paymentController.getMyPayments
);

router.post('/create', 
    protect, 
    paymentController.createPayment
);

// Admin routes
router.get('/', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    paymentController.getAllPayments
);

router.get('/pending', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    paymentController.getPendingPayments
);

router.patch('/:id/verify', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    paymentController.verifyPayment
);

module.exports = router; 