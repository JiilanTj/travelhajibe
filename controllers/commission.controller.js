const { User, AgentTier, Commission, Registration, Package, CommissionPayment } = require('../models');
const logger = require('../config/logger');
const { Op, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

exports.calculateCommission = async (jamaahId, packagePrice) => {
    try {
        // Find jamaah and their agent
        const jamaah = await User.findByPk(jamaahId, {
            include: [{
                model: User,
                as: 'Agent',
            include: [{ model: AgentTier }]
            }]
        });

        if (!jamaah || !jamaah.Agent) {
            return null;
        }

        // Calculate commission based on agent's tier
        const commissionRate = jamaah.Agent.AgentTier.baseCommissionRate;
        const commissionAmount = (packagePrice * commissionRate) / 100;

        // Update commission record
        const commission = await Commission.findOne({
            where: {
                jamaahId,
                status: 'PENDING'
            }
        });

        if (commission) {
            await commission.update({
            commissionAmount,
            status: 'PENDING'
        });

            logger.info(`Commission calculated for jamaah ${jamaahId}: ${commissionAmount}`);
        return commission;
        }

        return null;
    } catch (error) {
        logger.error('Error calculating commission:', error);
        return null;
    }
};

// Generate referral code for agent
exports.generateReferral = async (req, res) => {
    try {
        const agent = await User.findOne({
            where: { 
                id: req.user.id,
                role: 'AGEN'
            }
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Check if agent already has referral code
        if (agent.referralCode) {
            return res.status(400).json({
                success: false,
                message: 'Agent already has a referral code'
            });
        }

        // Generate unique referral code
        const referralCode = `AGENT-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Update agent with referral code
        await agent.update({ referralCode });

        logger.info(`Referral code generated for agent: ${agent.email}`);

        return res.status(200).json({
            success: true,
            message: 'Referral code generated successfully',
            data: {
                referralCode
            }
        });
    } catch (error) {
        logger.error('Error generating referral code:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get commissions for agent
exports.getMyCommissions = async (req, res) => {
    try {
        const commissions = await Commission.findAll({
            where: { agentId: req.user.id },
            include: [{
                model: Registration,
                include: [
                    { model: User },
                    { model: Package }
                ]
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

// Get agent stats
exports.getMyStats = async (req, res) => {
    try {
        const agent = await User.findOne({
            where: { 
                id: req.user.id,
                role: 'AGEN'
            },
            include: [{
                model: AgentTier,
                attributes: ['name', 'minimumJamaah', 'baseCommissionRate', 'benefits']
            }]
        });

        if (!agent) {
            return res.status(404).json({
                status: 'error',
                message: 'Agent not found'
            });
        }

        // Get all approved commissions
        const totalCommission = await Commission.sum('commissionAmount', {
            where: {
                agentId: req.user.id,
                status: 'APPROVED'
            }
        });

        // Get all referred jamaah
        const referredJamaah = await User.findAll({
            attributes: ['id', 'fullname', 'email', 'phone', 'createdAt'],
            include: [{
                model: Registration,
                required: true,
                attributes: [],
                include: [{
                    model: Commission,
                    required: true,
                    where: { agentId: req.user.id },
                    attributes: []
                }]
            }]
        });

        // Get next tier info
            const nextTier = await AgentTier.findOne({
                where: {
                    minimumJamaah: {
                    [Op.gt]: agent.totalJamaah || 0
                }
            },
            order: [['minimumJamaah', 'ASC']],
            attributes: ['name', 'minimumJamaah', 'benefits']
        });

        res.json({
            status: 'success',
            data: {
                tier: agent.AgentTier?.name || 'NO TIER',
                totalJamaah: agent.totalJamaah || 0,
                totalCommission: totalCommission ? totalCommission.toFixed(2) : "0.00",
                currentCommissionRate: agent.AgentTier?.baseCommissionRate || 0,
                nextTier: nextTier ? {
                    name: nextTier.name,
                    jamaahNeeded: nextTier.minimumJamaah - (agent.totalJamaah || 0),
                    benefits: nextTier.benefits
                } : null,
                referredJamaah: referredJamaah.map(jamaah => ({
                    id: jamaah.id,
                    fullname: jamaah.fullname,
                    email: jamaah.email,
                    phone: jamaah.phone,
                    registeredAt: jamaah.createdAt
                }))
            }
        });
    } catch (error) {
        logger.error('Get agent stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting agent stats'
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

// Check agent's own referral code
exports.checkMyReferral = async (req, res) => {
    try {
        const agent = await User.findOne({
            where: { 
                id: req.user.id,
                role: 'AGEN'
            },
            attributes: ['id', 'fullname', 'email', 'referralCode']
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        const response = {
            hasReferral: !!agent.referralCode,
            message: agent.referralCode 
                ? 'You already have a referral code' 
                : 'You don\'t have a referral code yet',
            data: {
                referralCode: agent.referralCode
            }
        };

        return res.status(200).json({
            success: true,
            ...response
        });
    } catch (error) {
        logger.error('Error checking referral code:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Request commission payment (for agent)
exports.requestPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { commissionIds, bankInfo } = req.body;

        if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Please select at least one commission to request payment'
            });
        }

        // Get all selected commissions
        const commissions = await Commission.findAll({
            where: {
                id: commissionIds,
                agentId: req.user.id,
                status: 'APPROVED',
                paymentRequestId: null
            },
            transaction
        });

        if (commissions.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'No valid commissions found for payment request'
            });
        }

        // Calculate total amount
        const totalAmount = commissions.reduce((sum, commission) => 
            sum + Number(commission.commissionAmount), 0
        );

        // Create payment request
        const paymentRequest = await CommissionPayment.create({
            agentId: req.user.id,
            amount: totalAmount,
            status: 'PENDING',
            bankName: bankInfo.bankName,
            accountNumber: bankInfo.accountNumber,
            accountName: bankInfo.accountName,
            notes: 'Payment request submitted by agent'
        }, { transaction });

        // Update commissions with payment request id
        await Promise.all(commissions.map(commission => 
            commission.update({ paymentRequestId: paymentRequest.id }, { transaction })
        ));

        await transaction.commit();

        res.json({
            status: 'success',
            message: 'Payment request submitted successfully',
            data: {
                requestId: paymentRequest.id,
                amount: totalAmount,
                commissionCount: commissions.length
            }
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('Request commission payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error submitting payment request'
        });
    }
};

// Process payment request (for admin)
exports.processPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!['PROCESS', 'DONE', 'REJECTED'].includes(status)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status'
            });
        }

        const paymentRequest = await CommissionPayment.findOne({
            where: { 
                id,
                status: status === 'DONE' ? 'PROCESS' : 'PENDING'
            },
            include: [{
                model: Commission,
                as: 'Commissions'
            }],
            transaction
        });

        if (!paymentRequest) {
            await transaction.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Payment request not found or invalid status transition'
            });
        }

        // Update payment request
        await paymentRequest.update({
            status,
            processedBy: req.user.id,
            processedAt: new Date(),
            notes: notes || `Status updated to ${status} by admin`
        }, { transaction });

        // If status is DONE, update all commissions
        if (status === 'DONE') {
            await Promise.all(paymentRequest.Commissions.map(commission =>
                commission.update({
                    status: 'PAID',
                    paidAt: new Date()
                }, { transaction })
            ));
        }

        await transaction.commit();

        res.json({
            status: 'success',
            message: `Payment request ${status.toLowerCase()} successfully`,
            data: paymentRequest
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('Process commission payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error processing payment request'
        });
    }
};

// Get all payment requests (for admin)
exports.getAllPaymentRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;

        const paymentRequests = await CommissionPayment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'Agent',
                    attributes: ['fullname', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'Processor',
                    attributes: ['fullname', 'email']
                },
                {
                    model: Commission,
                    as: 'Commissions',
                    attributes: ['id', 'commissionAmount', 'status']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        res.json({
            status: 'success',
            data: paymentRequests.rows,
            pagination: {
                total: paymentRequests.count,
                pages: Math.ceil(paymentRequests.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get payment requests error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching payment requests'
        });
    }
};

// Get my payment requests (for agent)
exports.getMyPaymentRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const whereClause = { agentId: req.user.id };
        if (status) whereClause.status = status;

        const paymentRequests = await CommissionPayment.findAndCountAll({
            where: whereClause,
            include: [{
                model: Commission,
                as: 'Commissions',
                attributes: ['id', 'commissionAmount', 'status']
            }],
            order: [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        res.json({
            status: 'success',
            data: paymentRequests.rows,
            pagination: {
                total: paymentRequests.count,
                pages: Math.ceil(paymentRequests.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get my payment requests error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching payment requests'
        });
    }
};

// Get available commissions for payment request (Agent)
exports.getAvailableCommissions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const commissions = await Commission.findAndCountAll({
            where: { 
                agentId: req.user.id,
                status: 'APPROVED',
                paymentRequestId: null // Only get commissions that haven't been requested
            },
            include: [{
                model: Registration,
                include: [
                    { 
                        model: User,
                        attributes: ['fullname', 'email', 'phone']
                    },
                    { 
                        model: Package,
                        attributes: ['name', 'price', 'departureDate']
                    }
                ]
            }],
            order: [['createdAt', 'DESC']],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        // Calculate total amount available
        const totalAvailable = commissions.rows.reduce((sum, commission) => 
            sum + Number(commission.commissionAmount), 0
        );

        res.json({
            status: 'success',
            data: {
                commissions: commissions.rows,
                totalAvailable: totalAvailable.toFixed(2),
                pagination: {
                    total: commissions.count,
                    pages: Math.ceil(commissions.count / limit),
                    page: +page,
                    limit: +limit
                }
            }
        });
    } catch (error) {
        logger.error('Get available commissions error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching available commissions'
        });
    }
};

// Check referral code (Agent)
exports.checkReferral = async (req, res) => {
    try {
        const agent = await User.findOne({
            where: { 
                id: req.user.id,
                role: 'AGEN'
            },
            attributes: ['id', 'referralCode']
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                hasReferral: false,
                message: 'Agent not found',
                data: {
                    referralCode: null
                }
            });
        }

        const hasReferral = !!agent.referralCode;

        res.json({
            success: true,
            hasReferral,
            message: hasReferral ? 'Referral code found' : 'No referral code found',
            data: {
                referralCode: agent.referralCode || null
            }
        });
    } catch (error) {
        logger.error('Check referral error:', error);
        res.status(500).json({
            success: false,
            hasReferral: false,
            message: 'Error checking referral code',
            data: {
                referralCode: null
            }
        });
    }
}; 