const express = require('express');
const router = express.Router();
const { 
    getMyStats,
    getMyCommissions,
    generateReferral,
    getAllCommissions,
    requestPayment,
    getMyPaymentRequests,
    getAllPaymentRequests,
    processPayment,
    getAvailableCommissions,
    checkReferral
} = require('../controllers/commission.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Agent routes
router.use(protect);

// Stats & Commission routes
router.get('/check-referral', restrictTo('AGEN'), checkReferral);
router.get('/my-stats', restrictTo('AGEN'), getMyStats);
router.get('/my-commissions', restrictTo('AGEN'), getMyCommissions);
router.post('/generate-referral', restrictTo('AGEN'), generateReferral);

// Payment request routes for agents
router.get('/available-commissions', restrictTo('AGEN'), getAvailableCommissions);
router.post('/request-payment', restrictTo('AGEN'), requestPayment);
router.get('/my-payment-requests', restrictTo('AGEN'), getMyPaymentRequests);

// Admin routes
router.get('/', restrictTo('ADMIN', 'SUPERADMIN'), getAllCommissions);
router.get('/payment-requests', restrictTo('ADMIN', 'SUPERADMIN'), getAllPaymentRequests);
router.patch('/payment-requests/:id/process', restrictTo('ADMIN', 'SUPERADMIN'), processPayment);

module.exports = router; 