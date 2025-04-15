const Registration = require('../models/Registration');
const Document = require('../models/Document');
const User = require('../models/User');
const Package = require('../models/Package');
const logger = require('../config/logger');
const { sendRegistrationEmail } = require('../utils/emailService');
const { sendWhatsAppNotification } = require('../utils/whatsappService');
const { Op } = require('sequelize');
const { calculateCommission } = require('./commission.controller');
const Commission = require('../models/Commission');
const AgentTier = require('../models/AgentTier');

exports.startRegistration = async (req, res) => {
    try {
        const { 
            packageId, 
            roomType, 
            roomPreferences,
            specialRequests 
        } = req.body;

        // Validate room type
        const validRoomTypes = [
            'SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD',
            'TENT_A', 'TENT_B', 'DORMITORY'
        ];
        
        if (!validRoomTypes.includes(roomType)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid room type'
            });
        }

        // Additional validation for tent/dormitory
        if (['TENT_A', 'TENT_B'].includes(roomType) && !roomPreferences?.tentSection) {
            return res.status(400).json({
                status: 'error',
                message: 'Tent section preference is required for tent options'
            });
        }

        // Check if package exists and available
        const package = await Package.findByPk(packageId);
        if (!package || !package.isActive || package.remainingQuota < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Package not available'
            });
        }

        // Get user with their agent info
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: User,
                as: 'Agent',
                include: [{ model: AgentTier }]
            }]
        });

        // Create registration
        const registration = await Registration.create({
            userId: req.user.id,
            packageId,
            roomType,
            roomPreferences: {
                ...roomPreferences,
                preferredLocation: roomType === 'SINGLE' ? 'standard' : roomPreferences?.preferredLocation,
                tentSection: ['TENT_A', 'TENT_B'].includes(roomType) ? roomPreferences.tentSection : null,
                dormitorySection: roomType === 'DORMITORY' ? roomPreferences.dormitorySection : null
            },
            specialRequests,
            status: 'DRAFT',
            referralCode: user.referredBy ? (await User.findByPk(user.referredBy))?.referralCode : null
        });

        // Decrease package quota
        await package.decrement('remainingQuota');

        // Create commission record if user was referred by an agent
        if (user.Agent && user.Agent.AgentTier) {
            const commissionRate = user.Agent.AgentTier.baseCommissionRate;
            const commissionAmount = (Number(package.price) * commissionRate) / 100;

            await Commission.create({
                agentId: user.Agent.id,
                jamaahId: user.id,
                registrationId: registration.id,
                packageId: package.id,
                commissionRate,
                commissionAmount,
                status: 'PENDING',
                packagePrice: package.price
            });

            logger.info(`Commission created for agent ${user.Agent.id} from jamaah ${user.id}`);
        }

        // Send notification
        await sendRegistrationEmail(req.user.email, {
            registrationId: registration.id,
            packageName: package.name
        });

        await sendWhatsAppNotification(req.user.phone, {
            type: 'REGISTRATION_STARTED',
            registrationId: registration.id
        });

        res.status(201).json({
            status: 'success',
            message: 'Registration started successfully',
            data: registration
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error starting registration'
        });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { type, number, expiryDate } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        const document = await Document.create({
            userId: req.user.id,
            type,
            number,
            expiryDate,
            file: `/uploads/documents/${file.filename}`,
            status: 'PENDING'
        });

        res.status(201).json({
            status: 'success',
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        logger.error('Document upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error uploading document'
        });
    }
};

// Get My Registrations
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Package,
                    attributes: ['name', 'type', 'departureDate', 'price', 'dp']
                },
                {
                    model: User,
                    as: 'mahram',
                    attributes: ['id', 'fullname', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Untuk setiap registrasi, ambil dokumen secara terpisah
        const registrationsWithDocuments = await Promise.all(
            registrations.map(async (registration) => {
                const documents = await Document.findAll({
                    where: { 
                        userId: req.user.id,
                        registrationId: registration.id 
                    },
                    attributes: ['id', 'type', 'status', 'file']
                });

                // Juga cari dokumen yang tidak terkait dengan registrasi
                const generalDocuments = await Document.findAll({
                    where: { 
                        userId: req.user.id,
                        registrationId: null 
                    },
                    attributes: ['id', 'type', 'status', 'file']
                });

                // Gabungkan semua dokumen
                const allDocuments = [...documents, ...generalDocuments];

                // Konversi ke JSON dan tambahkan dokumen
                const registrationData = registration.toJSON();
                registrationData.documents = allDocuments;
                
                return registrationData;
            })
        );

        res.json({
            status: 'success',
            data: registrationsWithDocuments
        });
    } catch (error) {
        logger.error('Get registrations error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching registrations'
        });
    }
};

// Get Registration Detail
exports.getRegistrationDetail = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            },
            include: [
                {
                    model: Package,
                    attributes: ['name', 'type', 'departureDate', 'price', 'dp', 'duration', 'facilities']
                },
                {
                    model: User,
                    as: 'mahram',
                    attributes: ['id', 'fullname', 'phone']
                }
            ]
        });

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Ambil dokumen terkait
        const documents = await Document.findAll({
            where: { 
                userId: req.user.id,
                registrationId: registration.id 
            },
            attributes: ['id', 'type', 'number', 'expiryDate', 'file', 'status', 'rejectionReason']
        });

        // Ambil dokumen umum yang tidak terkait dengan registrasi tertentu
        const generalDocuments = await Document.findAll({
            where: { 
                userId: req.user.id,
                registrationId: null 
            },
            attributes: ['id', 'type', 'number', 'expiryDate', 'file', 'status', 'rejectionReason']
        });

        // Konversi registrasi ke JSON dan tambahkan dokumen
        const registrationData = registration.toJSON();
        registrationData.documents = [...documents, ...generalDocuments];

        res.json({
            status: 'success',
            data: registrationData
        });
    } catch (error) {
        logger.error('Get registration detail error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching registration detail'
        });
    }
};

// Update Mahram
exports.updateMahram = async (req, res) => {
    try {
        const { mahramId, mahramStatus } = req.body;
        const registration = await Registration.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            }
        });

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Verify mahram exists
        const mahram = await User.findByPk(mahramId);
        if (!mahram) {
            return res.status(400).json({
                status: 'error',
                message: 'Mahram not found'
            });
        }

        await registration.update({
            mahramId,
            mahramStatus
        });

        res.json({
            status: 'success',
            message: 'Mahram updated successfully',
            data: registration
        });
    } catch (error) {
        logger.error('Update mahram error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating mahram'
        });
    }
};

// Cancel Registration
exports.cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            }
        });

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Check if cancellation is allowed
        if (!['DRAFT', 'WAITING_PAYMENT'].includes(registration.status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Registration cannot be cancelled at current status'
            });
        }

        await registration.update({ status: 'CANCELLED' });

        // Increase package quota back
        const package = await Package.findByPk(registration.packageId);
        await package.increment('remainingQuota');

        // Send notification
        await sendRegistrationEmail(req.user.email, {
            type: 'REGISTRATION_CANCELLED',
            registrationId: registration.id
        });

        res.json({
            status: 'success',
            message: 'Registration cancelled successfully'
        });
    } catch (error) {
        logger.error('Cancel registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error cancelling registration'
        });
    }
};

// Admin Routes

// Get All Registrations (Admin)
exports.getAllRegistrations = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search,
            packageId,
            startDate,
            endDate 
        } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (packageId) whereClause.packageId = packageId;

        const registrations = await Registration.findAndCountAll({
            where: whereClause,
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
                    attributes: ['name', 'type', 'departureDate', 'price', 'dp'],
                    where: {
                        ...(startDate && endDate ? {
                            departureDate: {
                                [Op.between]: [startDate, endDate]
                            }
                        } : {})
                    }
                }
            ],
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [['createdAt', 'DESC']]
        });

        // Untuk setiap registrasi, ambil dokumen secara terpisah
        const registrationsWithDocuments = await Promise.all(
            registrations.rows.map(async (registration) => {
                const documents = await Document.findAll({
                    where: { registrationId: registration.id },
                    attributes: ['id', 'type', 'status', 'file']
                });

                // Konversi ke JSON dan tambahkan dokumen
                const registrationData = registration.toJSON();
                registrationData.documents = documents;
                
                return registrationData;
            })
        );

        res.json({
            status: 'success',
            data: registrationsWithDocuments,
            pagination: {
                total: registrations.count,
                pages: Math.ceil(registrations.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get all registrations error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching registrations'
        });
    }
};

// Update Registration Status (Admin)
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const registration = await Registration.findByPk(req.params.id);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        await registration.update({ 
            status,
            notes: notes ? [...(registration.notes || []), {
                note: notes,
                by: req.user.email,
                at: new Date()
            }] : registration.notes
        });

        // Send notification
        await sendRegistrationEmail(registration.User.email, {
            type: 'STATUS_UPDATED',
            status,
            notes
        });

        res.json({
            status: 'success',
            message: 'Registration status updated successfully',
            data: registration
        });
    } catch (error) {
        logger.error('Update registration status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating registration status'
        });
    }
};

// Add Registration Note (Admin)
exports.addRegistrationNote = async (req, res) => {
    try {
        const { note } = req.body;
        const registration = await Registration.findByPk(req.params.id);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        const updatedNotes = [
            ...(registration.notes || []),
            {
                note,
                by: req.user.email,
                at: new Date()
            }
        ];

        await registration.update({ notes: updatedNotes });

        res.json({
            status: 'success',
            message: 'Note added successfully',
            data: {
                notes: updatedNotes
            }
        });
    } catch (error) {
        logger.error('Add registration note error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding note'
        });
    }
}; 