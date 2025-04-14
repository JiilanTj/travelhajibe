const Document = require('../models/Document');
const Registration = require('../models/Registration');
const User = require('../models/User');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const { getFullUrl } = require('../utils/urlHelper');
const fs = require('fs').promises;
const path = require('path');

// Upload single document
exports.uploadDocument = async (req, res) => {
    try {
        const { type, number, expiryDate, registrationId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        // Check if document type already exists for user
        const existingDoc = await Document.findOne({
            where: {
                userId: req.user.id,
                type,
                ...(registrationId ? { registrationId } : {})
            }
        });

        if (existingDoc) {
            // Delete old file
            const oldFilePath = path.join(__dirname, '../public', existingDoc.file);
            await fs.unlink(oldFilePath).catch(err => 
                logger.error('Error deleting old file:', err)
            );

            // Update existing document
            await existingDoc.update({
                number,
                expiryDate,
                file: `/uploads/documents/${file.filename}`,
                status: 'PENDING',
                verifiedBy: null,
                verifiedAt: null,
                rejectionReason: null
            });

            return res.json({
                status: 'success',
                message: 'Document updated successfully',
                data: existingDoc
            });
        }

        // Create new document
        const document = await Document.create({
            userId: req.user.id,
            type,
            number,
            expiryDate,
            registrationId,
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

// Upload multiple documents
exports.uploadMultipleDocuments = async (req, res) => {
    try {
        const files = req.files;
        const data = JSON.parse(req.body.data || '{}');
        const registrationId = req.body.registrationId || null;
        const uploadedDocs = [];

        for (const [key, fileArray] of Object.entries(files)) {
            const file = fileArray[0]; // Get first file from array
            const docData = data[key] || {};

            // Check if document type already exists
            const existingDoc = await Document.findOne({
                where: {
                    userId: req.user.id,
                    type: key.toUpperCase(),
                    ...(registrationId ? { registrationId } : {})
                }
            });

            if (existingDoc) {
                // Delete old file
                const oldFilePath = path.join(__dirname, '../public', existingDoc.file);
                await fs.unlink(oldFilePath).catch(err => 
                    logger.error('Error deleting old file:', err)
                );

                // Update existing document
                const updatedDoc = await existingDoc.update({
                    number: docData.number,
                    expiryDate: docData.expiryDate,
                    file: `/uploads/documents/${file.filename}`,
                    status: 'PENDING',
                    verifiedBy: null,
                    verifiedAt: null,
                    rejectionReason: null
                });

                uploadedDocs.push(updatedDoc);
            } else {
                // Create new document
                const newDoc = await Document.create({
                    userId: req.user.id,
                    type: key.toUpperCase(),
                    number: docData.number,
                    expiryDate: docData.expiryDate,
                    file: `/uploads/documents/${file.filename}`,
                    status: 'PENDING',
                    registrationId
                });

                uploadedDocs.push(newDoc);
            }
        }

        res.status(201).json({
            status: 'success',
            message: 'Documents uploaded successfully',
            data: uploadedDocs
        });
    } catch (error) {
        logger.error('Multiple documents upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error uploading documents'
        });
    }
};

// Get my documents
exports.getMyDocuments = async (req, res) => {
    try {
        const documents = await Document.findAll({
            where: { userId: req.user.id },
            order: [['updatedAt', 'DESC']]
        });

        // Transform document URLs
        const transformedDocs = documents.map(doc => ({
            ...doc.toJSON(),
            file: {
                path: doc.file,
                url: getFullUrl(req, doc.file)
            }
        }));

        res.json({
            status: 'success',
            data: transformedDocs
        });
    } catch (error) {
        logger.error('Get documents error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching documents'
        });
    }
};

// Get single document
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        // Transform document URL
        const transformedDoc = {
            ...document.toJSON(),
            file: {
                path: document.file,
                url: getFullUrl(req, document.file)
            }
        };

        res.json({
            status: 'success',
            data: transformedDoc
        });
    } catch (error) {
        logger.error('Get document error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching document'
        });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        // Delete file from storage
        const filePath = path.join(__dirname, '../public', document.file);
        await fs.unlink(filePath);

        // Delete from database
        await document.destroy();

        res.json({
            status: 'success',
            message: 'Document deleted successfully'
        });
    } catch (error) {
        logger.error('Delete document error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting document'
        });
    }
};

// Admin Routes

// Get all documents (Admin)
exports.getAllDocuments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            type,
            search 
        } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const documents = await Document.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['fullname', 'email'],
                where: search ? {
                    [Op.or]: [
                        { fullname: { [Op.iLike]: `%${search}%` } },
                        { email: { [Op.iLike]: `%${search}%` } }
                    ]
                } : {}
            }],
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [['updatedAt', 'DESC']]
        });

        // Transform document URLs
        const transformedDocs = documents.rows.map(doc => ({
            ...doc.toJSON(),
            file: {
                path: doc.file,
                url: getFullUrl(req, doc.file)
            }
        }));

        res.json({
            status: 'success',
            data: transformedDocs,
            pagination: {
                total: documents.count,
                pages: Math.ceil(documents.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get all documents error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching documents'
        });
    }
};

// Verify document (Admin)
exports.verifyDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        await document.update({
            status: 'APPROVED',
            verifiedBy: req.user.id,
            verifiedAt: new Date()
        });

        res.json({
            status: 'success',
            message: 'Document verified successfully',
            data: document
        });
    } catch (error) {
        logger.error('Verify document error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error verifying document'
        });
    }
};

// Reject document (Admin)
exports.rejectDocument = async (req, res) => {
    try {
        const { reason } = req.body;
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        await document.update({
            status: 'REJECTED',
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
            rejectionReason: reason
        });

        // Send notification to user
        const user = await User.findByPk(document.userId);
        if (user) {
            // You can implement email/WhatsApp notification here
            logger.info(`Document rejected notification sent to ${user.email}`);
        }

        res.json({
            status: 'success',
            message: 'Document rejected successfully',
            data: document
        });
    } catch (error) {
        logger.error('Reject document error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error rejecting document'
        });
    }
}; 