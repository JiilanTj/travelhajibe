const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Protect all finance routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPERADMIN'));

// Dashboard
router.get('/dashboard', financeController.getDashboardSummary);

// Reports
router.get('/payments', financeController.getPaymentReports);
router.get('/commissions', financeController.getCommissionReports);
router.get('/packages', financeController.getPackageReports);

module.exports = router;