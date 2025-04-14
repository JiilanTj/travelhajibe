const express = require('express');
const router = express.Router();
const { checkConnection } = require('../utils/whatsappService');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');
const { sendRegistrationEmail } = require('../utils/emailService');

router.get('/status', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    (req, res) => {
        const isConnected = checkConnection();
        res.json({
            status: 'success',
            data: {
                connected: isConnected
            }
        });
    }
);

// Hanya tambahkan di development
if (process.env.NODE_ENV !== 'production') {
    router.post('/test-email', 
        protect, 
        restrictTo('ADMIN', 'SUPERADMIN'),
        async (req, res) => {
            try {
                const result = await sendRegistrationEmail(
                    req.user.email,
                    {
                        type: 'REGISTRATION_STARTED',
                        registrationId: 'TEST-123',
                        packageName: 'Paket Test'
                    }
                );

                res.json({
                    status: 'success',
                    message: result ? 'Test email sent' : 'Failed to send test email'
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    message: 'Error sending test email'
                });
            }
        }
    );
}

module.exports = router; 