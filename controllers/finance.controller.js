const { Payment, Registration, Package, User, Commission, CommissionPayment } = require('../models');
const { Op, Sequelize } = require('sequelize');
const logger = require('../config/logger');

// Get Summary Dashboard
exports.getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get total income
        const totalIncome = await Payment.sum('amount', {
            where: { status: 'PAID' }
        });

        // Get monthly income
        const monthlyIncome = await Payment.sum('amount', {
            where: {
                status: 'PAID',
                paymentDate: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        // Get pending payments
        const pendingAmount = await Payment.sum('amount', {
            where: { status: 'VERIFYING' }
        });

        // Get commission payouts
        const totalCommissionPaid = await CommissionPayment.sum('amount', {
            where: { status: 'DONE' }
        });

        res.json({
            status: 'success',
            data: {
                totalIncome: totalIncome || 0,
                monthlyIncome: monthlyIncome || 0,
                pendingAmount: pendingAmount || 0,
                totalCommissionPaid: totalCommissionPaid || 0,
                netIncome: (totalIncome || 0) - (totalCommissionPaid || 0)
            }
        });
    } catch (error) {
        logger.error('Get finance dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting finance dashboard'
        });
    }
};

// Get Payment Reports with filters
exports.getPaymentReports = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            status,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const payments = await Payment.findAndCountAll({
            where: whereClause,
            include: [{
                model: Registration,
                include: [
                    { 
                        model: User,
                        attributes: ['fullname', 'email']
                    },
                    { 
                        model: Package,
                        attributes: ['name', 'type']
                    }
                ]
            }],
            order: [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        // Calculate totals
        const totals = await Payment.findAll({
            where: whereClause,
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
                ['status', 'status']
            ],
            group: ['status']
        });

        res.json({
            status: 'success',
            data: {
                payments: payments.rows,
                totals: totals.reduce((acc, curr) => ({
                    ...acc,
                    [curr.status]: curr.get('totalAmount')
                }), {}),
                pagination: {
                    total: payments.count,
                    pages: Math.ceil(payments.count / limit),
                    page: +page,
                    limit: +limit
                }
            }
        });
    } catch (error) {
        logger.error('Get payment reports error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting payment reports'
        });
    }
};

// Get Commission Reports
exports.getCommissionReports = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const commissionPayments = await CommissionPayment.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'Agent',
                attributes: ['fullname', 'email', 'phone']
            }],
            order: [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        // Calculate totals by status
        const totals = await CommissionPayment.findAll({
            where: whereClause,
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
                ['status', 'status']
            ],
            group: ['status']
        });

        res.json({
            status: 'success',
            data: {
                commissionPayments: commissionPayments.rows,
                totals: totals.reduce((acc, curr) => ({
                    ...acc,
                    [curr.status]: curr.get('totalAmount')
                }), {}),
                pagination: {
                    total: commissionPayments.count,
                    pages: Math.ceil(commissionPayments.count / limit),
                    page: +page,
                    limit: +limit
                }
            }
        });
    } catch (error) {
        logger.error('Get commission reports error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting commission reports'
        });
    }
};

// Get Package Revenue Reports
exports.getPackageReports = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const whereClause = {};
        if (type) whereClause.type = type;
        if (startDate && endDate) {
            whereClause.departureDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const packages = await Package.findAndCountAll({
            where: whereClause,
            include: [{
                model: Registration,
                include: [{
                    model: Payment,
                    where: { status: 'PAID' }
                }]
            }],
            order: [['departureDate', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        // Transform data to include revenue calculations
        const packageReports = packages.rows.map(pkg => {
            const totalRevenue = pkg.Registrations.reduce((sum, reg) => {
                return sum + reg.Payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0);
            }, 0);

            return {
                id: pkg.id,
                name: pkg.name,
                type: pkg.type,
                departureDate: pkg.departureDate,
                price: pkg.price,
                quota: pkg.quota,
                remainingQuota: pkg.remainingQuota,
                registrations: pkg.Registrations.length,
                totalRevenue
            };
        });

        res.json({
            status: 'success',
            data: {
                packages: packageReports,
                pagination: {
                    total: packages.count,
                    pages: Math.ceil(packages.count / limit),
                    page: +page,
                    limit: +limit
                }
            }
        });
    } catch (error) {
        logger.error('Get package reports error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting package reports'
        });
    }
};