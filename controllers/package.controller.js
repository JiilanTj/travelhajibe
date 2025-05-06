const { Op } = require('sequelize');
const Package = require('../models/Package');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const { transformPackageUrls, getFullUrl } = require('../utils/urlHelper');
const multer = require('multer');

// Create new package
exports.createPackage = async (req, res) => {
    try {
        // Parse JSON data from form-data
        let packageData;
        try {
            packageData = req.body.data ? JSON.parse(req.body.data) : req.body;
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid JSON data format'
            });
        }

        // Set remaining quota same as initial quota if not provided
        if (packageData.quota && !packageData.remainingQuota) {
            packageData.remainingQuota = packageData.quota;
        }
        
        // Handle main image
        if (req.files && req.files.image && req.files.image[0]) {
            packageData.image = `/uploads/packages/${req.files.image[0].filename}`;
        }
        
        // Handle additional images
        if (req.files && req.files.additionalImages) {
            packageData.additionalImages = req.files.additionalImages.map(
                file => `/uploads/packages/${file.filename}`
            );
        }

        const package = await Package.create(packageData);
        
        // Transform package URLs
        const transformedPackage = {
            ...package.toJSON(),
            image: package.image ? {
                path: package.image,
                url: getFullUrl(req, package.image)
            } : null,
            additionalImages: package.additionalImages ? package.additionalImages.map(imagePath => ({
                path: imagePath,
                url: getFullUrl(req, imagePath)
            })) : []
        };

        res.status(201).json({
            status: 'success',
            message: 'Package created successfully',
            data: transformedPackage
        });
    } catch (error) {
        logger.error('Create package error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error creating package'
        });
    }
};

// Get all packages with pagination and filters
exports.getAllPackages = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search = '',
            status,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Build where clause
        const whereClause = {
            isActive: true // Only show active packages
        };
        
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }
        if (status) {
            whereClause.status = status;
        }
        if (startDate && endDate) {
            whereClause.departureDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const packages = await Package.findAndCountAll({
            where: whereClause,
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [[sortBy, sortOrder]]
        });

        // Transform URLs for each package
        const transformedPackages = packages.rows.map(pkg => {
            const packageData = pkg.toJSON();
            
            // Transform main image
            if (packageData.image) {
                packageData.image = {
                    path: packageData.image,
                    url: getFullUrl(req, packageData.image)
                };
            }

            // Transform additional images
            if (packageData.additionalImages && Array.isArray(packageData.additionalImages)) {
                packageData.additionalImages = packageData.additionalImages.map(imagePath => ({
                    path: imagePath,
                    url: getFullUrl(req, imagePath)
                }));
            }

            return packageData;
        });

        res.json({
            status: 'success',
            data: transformedPackages,
            pagination: {
                total: packages.count,
                pages: Math.ceil(packages.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get packages error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching packages'
        });
    }
};

// Get single package
exports.getPackage = async (req, res) => {
    try {
        const package = await Package.findByPk(req.params.id);

        if (!package) {
            return res.status(404).json({
                status: 'error',
                message: 'Package not found'
            });
        }

        // Transform package URLs
        const packageData = package.toJSON();
        
        // Transform main image
        if (packageData.image) {
            packageData.image = {
                path: packageData.image,
                url: getFullUrl(req, packageData.image)
            };
        }

        // Transform additional images
        if (packageData.additionalImages && Array.isArray(packageData.additionalImages)) {
            packageData.additionalImages = packageData.additionalImages.map(imagePath => ({
                path: imagePath,
                url: getFullUrl(req, imagePath)
            }));
        }

        res.json({
            status: 'success',
            data: packageData
        });
    } catch (error) {
        logger.error('Get package error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching package'
        });
    }
};

// Update package
exports.updatePackage = async (req, res) => {
    try {
        const package = await Package.findByPk(req.params.id);
        
        if (!package) {
            return res.status(404).json({
                status: 'error',
                message: 'Package not found'
            });
        }

        // Parse JSON data from form-data
        let updateData;
        try {
            updateData = req.body.data ? JSON.parse(req.body.data) : req.body;
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid JSON data format'
            });
        }

        // Handle main image
        if (req.files && req.files.image && req.files.image[0]) {
            // Delete old image if exists
            if (package.image) {
                const oldImagePath = path.join(__dirname, '../public', package.image);
                await fs.unlink(oldImagePath).catch(err => 
                    logger.error('Error deleting old image:', err)
                );
            }
            updateData.image = `/uploads/packages/${req.files.image[0].filename}`;
        }

        // Handle additional images
        if (req.files && req.files.additionalImages) {
            // Delete old additional images if they exist
            if (package.additionalImages && Array.isArray(package.additionalImages)) {
                for (const oldImage of package.additionalImages) {
                    const oldImagePath = path.join(__dirname, '../public', oldImage);
                    await fs.unlink(oldImagePath).catch(err => 
                        logger.error('Error deleting old additional image:', err)
                    );
                }
            }
            updateData.additionalImages = req.files.additionalImages.map(
                file => `/uploads/packages/${file.filename}`
            );
        }

        // Update the package
        await package.update(updateData);
        
        // Fetch updated package to get fresh data
        const updatedPackage = await Package.findByPk(package.id);
        
        // Transform package URLs
        const transformedPackage = {
            ...updatedPackage.toJSON(),
            image: updatedPackage.image ? {
                path: updatedPackage.image,
                url: getFullUrl(req, updatedPackage.image)
            } : null,
            additionalImages: updatedPackage.additionalImages ? updatedPackage.additionalImages.map(imagePath => ({
                path: imagePath,
                url: getFullUrl(req, imagePath)
            })) : []
        };

        res.json({
            status: 'success',
            message: 'Package updated successfully',
            data: transformedPackage
        });
    } catch (error) {
        logger.error('Update package error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error updating package'
        });
    }
};

// Delete package
exports.deletePackage = async (req, res) => {
    try {
        const package = await Package.findByPk(req.params.id);
        
        if (!package) {
            return res.status(404).json({
                status: 'error',
                message: 'Package not found'
            });
        }

        // Soft delete
        await package.update({ isActive: false });
        logger.info(`Package deleted by ${req.user.email} (${req.user.role}): ${package.name}`);

        res.json({
            status: 'success',
            message: 'Package deleted successfully'
        });
    } catch (error) {
        logger.error('Delete package error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting package'
        });
    }
}; 