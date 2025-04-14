const Commission = require('../models/Commission');
const User = require('../models/User');
const AgentTier = require('../models/AgentTier');
const logger = require('../config/logger');
const { Op } = require('sequelize');

exports.calculateCommission = async (registration) => {
    try {
        // Cek apakah ada referral code
        if (!registration.referralCode) return null;

        // Ambil data agen
        const agent = await User.findOne({
            where: { referralCode: registration.referralCode },
            include: [{ model: AgentTier }]
        });

        if (!agent || !agent.AgentTier) return null;

        // Hitung komisi
        const commissionRate = agent.AgentTier.baseCommissionRate;
        const commissionAmount = (registration.Package.price * commissionRate) / 100;

        // Buat record komisi
        const commission = await Commission.create({
            agentId: agent.id,
            registrationId: registration.id,
            packagePrice: registration.Package.price,
            commissionRate,
            commissionAmount,
            status: 'PENDING'
        });

        return commission;
    } catch (error) {
        logger.error('Commission calculation error:', error);
        return null;
    }
};

// Get komisi untuk agen
exports.getMyCommissions = async (req, res) => {
    try {
        const commissions = await Commission.findAll({
            where: { agentId: req.user.id },
            include: [{
                model: 'Registration',
                include: ['User', 'Package']
            }],
            order: [['createdAt', 'DESC']]
        });

        const stats = {
            totalCommission: commissions.reduce((sum, comm) => 
                sum + parseFloat(comm.commissionAmount), 0),
            pendingCommission: commissions
                .filter(comm => comm.status === 'PENDING')
                .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0),
            paidCommission: commissions
                .filter(comm => comm.status === 'PAID')
                .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0),
            totalJamaah: commissions.length
        };

        res.json({
            status: 'success',
            data: { commissions, stats }
        });
    } catch (error) {
        logger.error('Get commissions error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching commissions'
        });
    }
};

// Get statistik agen
exports.getMyStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: AgentTier }]
        });

        const stats = {
            tier: user.AgentTier.name,
            totalJamaah: user.totalJamaah,
            totalCommission: user.totalCommission,
            nextTier: null
        };

        // Calculate progress to next tier
        if (user.AgentTier.name !== 'GOLD') {
            const nextTier = await AgentTier.findOne({
                where: {
                    minimumJamaah: {
                        [Op.gt]: user.totalJamaah
                    }
                },
                order: [['minimumJamaah', 'ASC']]
            });

            if (nextTier) {
                stats.nextTier = {
                    name: nextTier.name,
                    jamaahNeeded: nextTier.minimumJamaah - user.totalJamaah,
                    benefits: nextTier.benefits
                };
            }
        }

        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching stats'
        });
    }
};

// Get all commissions (Admin)
exports.getAllCommissions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const where = {};
        if (status) where.status = status;

        const commissions = await Commission.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['fullname', 'email', 'referralCode']
            }],
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: commissions.rows,
            pagination: {
                total: commissions.count,
                pages: Math.ceil(commissions.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get all commissions error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching commissions'
        });
    }
};

// Approve commission (Admin)
exports.approveCommission = async (req, res) => {
    try {
        const commission = await Commission.findByPk(req.params.id);
        
        if (!commission) {
            return res.status(404).json({
                status: 'error',
                message: 'Commission not found'
            });
        }

        await commission.update({
            status: 'APPROVED'
        });

        res.json({
            status: 'success',
            message: 'Commission approved successfully',
            data: commission
        });
    } catch (error) {
        logger.error('Approve commission error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error approving commission'
        });
    }
};

// Pay commission (Admin)
exports.payCommission = async (req, res) => {
    try {
        const commission = await Commission.findByPk(req.params.id);
        
        if (!commission) {
            return res.status(404).json({
                status: 'error',
                message: 'Commission not found'
            });
        }

        await commission.update({
            status: 'PAID',
            paidAt: new Date()
        });

        // Update agent's total commission
        await User.increment('totalCommission', {
            by: commission.commissionAmount,
            where: { id: commission.agentId }
        });

        res.json({
            status: 'success',
            message: 'Commission paid successfully',
            data: commission
        });
    } catch (error) {
        logger.error('Pay commission error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error paying commission'
        });
    }
}; 