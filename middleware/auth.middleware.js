const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');
const logger = require('../config/logger');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route'
            });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                status: 'error',
                message: 'Token has been invalidated'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User no longer exists'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User account is inactive'
            });
        }

        // Add user to request with role
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route'
        });
    }
}; 