const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const resetSuperAdmin = async () => {
    try {
        const superadmin = await User.findOne({
            where: {
                email: process.env.SUPERADMIN_EMAIL,
                role: 'SUPERADMIN'
            }
        });

        if (!superadmin) {
            logger.error('Superadmin account not found');
            process.exit(1);
        }

        // Reset password
        await superadmin.update({
            password: process.env.SUPERADMIN_PASSWORD || 'Superadmin123!'
        });

        logger.info('Superadmin password reset successfully');
        logger.info(`Email: ${superadmin.email}`);
        logger.info('New password: [Check .env file or use default: Superadmin123!]');

        process.exit(0);
    } catch (error) {
        logger.error('Error resetting superadmin password:', error);
        process.exit(1);
    }
};

resetSuperAdmin(); 