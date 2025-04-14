const Payment = require('../models/payment');
const Registration = require('../models/Registration');
const Package = require('../models/Package');
const User = require('../models/User');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const { getFullUrl } = require('../utils/urlHelper');
const { sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/payments';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images and PDF only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$/)) {
            req.fileValidationError = 'Only image and PDF files are allowed!';
            return cb(new Error('Only image and PDF files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('transferProof');

// Get payment info for a registration
exports.getPaymentInfo = async (req, res) => {
    try {
        const { registrationId } = req.params;
        
        if (!registrationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Registration ID is required'
            });
        }
        
        const registration = await Registration.findOne({
            where: { id: registrationId },
            include: [
                {
                    model: Package,
                    attributes: ['name', 'price', 'dp']
                },
                {
                    model: User,
                    attributes: ['fullname', 'email', 'phone']
                }
            ]
        });

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Get all payments for this registration
        const payments = await Payment.findAll({
            where: { registrationId },
            order: [['createdAt', 'DESC']]
        });

        // Calculate total paid amount
        const totalPaid = payments.reduce((sum, payment) => 
            payment.status === 'PAID' ? sum + Number(payment.amount) : sum, 
            0
        );

        // Calculate remaining amount
        const packagePrice = Number(registration.Package.price);
        const remainingAmount = packagePrice - totalPaid;

        // Determine next payment type
        let nextPayment = null;
        if (remainingAmount > 0) {
            const hasDP = payments.some(p => p.type === 'DP' && p.status === 'PAID');
            nextPayment = {
                type: hasDP ? 'INSTALLMENT' : 'DP',
                amount: hasDP ? remainingAmount : packagePrice * (Number(registration.Package.dp) / 100)
            };
        }

        // Transform payment data
        const paymentData = {
            registration: {
                id: registration.id,
                package: {
                    name: registration.Package.name,
                    price: packagePrice,
                    dp: registration.Package.dp
                },
                user: {
                    fullname: registration.User.fullname,
                    email: registration.User.email,
                    phone: registration.User.phone
                }
            },
            paymentStatus: {
                totalPaid,
                remainingAmount,
                isFullyPaid: remainingAmount <= 0
            },
            payments: payments.map(payment => ({
                ...payment.toJSON(),
                transferProof: {
                    path: payment.transferProof,
                    url: getFullUrl(req, payment.transferProof)
                }
            })),
            nextPayment
        };

        res.json({
            status: 'success',
            data: paymentData
        });
    } catch (error) {
        logger.error('Get payment info error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error getting payment info'
        });
    }
};

// Get all payments for logged in user
exports.getMyPayments = async (req, res) => {
    try {
        // Dapatkan semua registrasi milik user yang login
        const registrations = await Registration.findAll({
            where: { userId: req.user.id },
            attributes: ['id'],
            raw: true
        });

        const registrationIds = registrations.map(reg => reg.id);

        // Dapatkan semua pembayaran untuk registrasi tersebut
        const payments = await Payment.findAll({
            where: { 
                registrationId: { [Op.in]: registrationIds } 
            },
            include: [
                {
                    model: Registration,
                    attributes: ['id', 'status'],
                    include: [
                        {
                            model: Package,
                            attributes: ['name', 'price', 'departureDate']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: payments.map(payment => ({
                id: payment.id,
                registrationId: payment.registrationId,
                packageName: payment.Registration.Package.name,
                packagePrice: Number(payment.Registration.Package.price),
                departureDate: payment.Registration.Package.departureDate,
                type: payment.type,
                amount: Number(payment.amount),
                dueAmount: Number(payment.dueAmount),
                status: payment.status,
                paymentDate: payment.paymentDate,
                paymentMethod: payment.paymentMethod,
                bankName: payment.bankName,
                accountNumber: payment.accountNumber,
                accountName: payment.accountName,
                transferDate: payment.transferDate,
                transferProof: {
                    path: payment.transferProof,
                    url: getFullUrl(req, payment.transferProof)
                },
                notes: payment.notes,
                verificationNotes: payment.verificationNotes,
                verifiedAt: payment.verifiedAt
            }))
        });
    } catch (error) {
        logger.error('Get my payments error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching payments'
        });
    }
};

// Create payment
exports.createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Handle file upload first
        upload(req, res, async function(err) {
            if (err) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }

            if (req.fileValidationError) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: req.fileValidationError
                });
            }

            if (!req.file) {
                await transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: 'Please upload transfer proof'
                });
            }

            try {
                const { 
                    registrationId, 
                    type, 
                    amount, 
                    bankName, 
                    accountNumber, 
                    accountName, 
                    transferDate, 
                    notes 
                } = req.body;

                // Validasi input
                if (!registrationId || !type || !amount || !bankName || !accountNumber || !accountName || !transferDate) {
                    await transaction.rollback();
                    return res.status(400).json({
                        status: 'error',
                        message: 'All fields are required',
                        missingFields: {
                            registrationId: !registrationId,
                            type: !type,
                            amount: !amount,
                            bankName: !bankName,
                            accountNumber: !accountNumber,
                            accountName: !accountName,
                            transferDate: !transferDate
                        }
                    });
                }
        
        // Pastikan registrasi milik user yang login
        const registration = await Registration.findOne({
            where: {
                id: registrationId,
                userId: req.user.id
            },
            include: [
                {
                    model: Package,
                            attributes: ['price', 'dp']
                }
            ],
            transaction
        });

        if (!registration) {
            await transaction.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Validasi tipe pembayaran
                if (!['DP', 'INSTALLMENT', 'FULL_PAYMENT'].includes(type)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Invalid payment type'
            });
        }

                // Hitung total yang sudah dibayar
                const totalPaid = await Payment.sum('amount', {
            where: { 
                registrationId,
                status: 'PAID'
            },
            transaction
        });

        const packagePrice = Number(registration.Package.price);
                const dpAmount = packagePrice * (Number(registration.Package.dp) / 100);
                const remainingAmount = packagePrice - (totalPaid || 0);

        // Validasi jumlah pembayaran
                if (type === 'DP' && Number(amount) < dpAmount) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                        message: `DP amount must be at least ${dpAmount}`
            });
        }

                if (type === 'FULL_PAYMENT' && Number(amount) < remainingAmount) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                        message: `Full payment amount must be at least ${remainingAmount}`
                    });
                }

                // Buat pembayaran baru
        const payment = await Payment.create({
            registrationId,
            type,
                    amount: Number(amount),
                    dueAmount: type === 'DP' ? dpAmount : remainingAmount,
                    dueDate: new Date(),
                    status: 'VERIFYING',
                    paymentMethod: 'bank_transfer',
                    bankName,
                    accountNumber,
                    accountName,
                    transferDate: new Date(transferDate),
                    transferProof: `/uploads/payments/${req.file.filename}`,
                    notes
        }, { transaction });

        await transaction.commit();

                // Transform payment data to include full URL
                const paymentData = payment.toJSON();
                paymentData.transferProof = {
                    path: paymentData.transferProof,
                    url: getFullUrl(req, paymentData.transferProof)
                };

        res.status(201).json({
            status: 'success',
                    message: 'Payment created successfully. Waiting for admin verification.',
                    data: paymentData
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('Create payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating payment'
        });
    }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search,
            type 
        } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const payments = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Registration,
                    include: [
                        {
                            model: User,
                            attributes: ['fullname', 'email', 'phone'],
                            where: search ? {
                                [Op.or]: [
                                    { fullname: { [Op.iLike]: `%${search}%` } },
                                    { email: { [Op.iLike]: `%${search}%` } }
                                ]
                            } : {}
                        },
                        {
                            model: Package,
                            attributes: ['name', 'type', 'departureDate', 'price']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'verifier',
                    attributes: ['fullname', 'email'],
                    required: false
                }
            ],
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [['createdAt', 'DESC']]
        });

        const transformedPayments = payments.rows.map(payment => {
            const paymentData = payment.toJSON();
            return {
                ...paymentData,
                transferProof: {
                    path: payment.transferProof,
                    url: getFullUrl(req, payment.transferProof)
                }
            };
        });

        res.json({
            status: 'success',
            data: transformedPayments,
            pagination: {
                total: payments.count,
                pages: Math.ceil(payments.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get all payments error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching payments'
        });
    }
};

// Get pending payments (admin only)
exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { 
                status: 'VERIFYING'
            },
            include: [
                {
                    model: Registration,
                    include: [
                        {
                            model: Package,
                            attributes: ['name', 'price']
                        },
                        {
                            model: User,
                            attributes: ['fullname', 'email', 'phone']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: payments.map(payment => ({
                id: payment.id,
                registrationId: payment.registrationId,
                type: payment.type,
                amount: Number(payment.amount),
                dueAmount: Number(payment.dueAmount),
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                bankName: payment.bankName,
                accountNumber: payment.accountNumber,
                accountName: payment.accountName,
                transferDate: payment.transferDate,
                transferProof: {
                    path: payment.transferProof,
                    url: getFullUrl(req, payment.transferProof)
                },
                notes: payment.notes,
                createdAt: payment.createdAt,
                registration: {
                    id: payment.Registration.id,
                    status: payment.Registration.status,
                    package: {
                        name: payment.Registration.Package.name,
                        price: Number(payment.Registration.Package.price)
                    },
                    user: {
                        fullname: payment.Registration.User.fullname,
                        email: payment.Registration.User.email,
                        phone: payment.Registration.User.phone
                    }
                }
            }))
        });
    } catch (error) {
        logger.error('Get pending payments error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching pending payments'
        });
    }
};

// Verify payment (admin only)
exports.verifyPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { status, verificationNotes } = req.body;

        if (!id) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Payment ID is required'
            });
        }

        // Validasi status
        if (!['PAID', 'FAILED'].includes(status)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status. Must be either PAID or FAILED'
            });
        }

        // Cari pembayaran
        const payment = await Payment.findOne({
            where: { 
                id: id,
                status: 'VERIFYING' // Hanya bisa verifikasi payment yang statusnya VERIFYING
            },
            include: [
                {
                    model: Registration,
                    include: [
                        {
                            model: Package,
                            attributes: ['price']
                        }
                    ]
                }
            ],
            transaction
        });
        
        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found or already verified'
            });
        }

        // Update status pembayaran
        await payment.update({
            status,
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
            verificationNotes,
            paymentDate: status === 'PAID' ? new Date() : null
        }, { transaction });

        // Jika pembayaran berhasil, update status registrasi jika perlu
        if (status === 'PAID') {
            const totalPaid = await Payment.sum('amount', {
                where: {
                    registrationId: payment.registrationId,
                    status: 'PAID'
                },
                transaction
            });

            const packagePrice = Number(payment.Registration.Package.price);
            if (totalPaid >= packagePrice) {
                await payment.Registration.update({
                    status: 'PAID'
                        }, { transaction });
            }
        }

        await transaction.commit();

        res.json({
            status: 'success',
            message: 'Payment verified successfully',
            data: payment
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('Verify payment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error verifying payment'
        });
    }
}; 