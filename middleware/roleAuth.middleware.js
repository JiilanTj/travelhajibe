const logger = require('../config/logger');

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by user ${req.user.email} with role ${req.user.role}`);
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
}; 