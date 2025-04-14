const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const documentController = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');
const upload = require('../config/documentUpload');

// Registration Routes
router.post('/start', 
    protect, 
    registrationController.startRegistration
);

router.get('/my-registrations', 
    protect, 
    registrationController.getMyRegistrations
);

router.get('/:id', 
    protect, 
    registrationController.getRegistrationDetail
);

router.patch('/:id/update-mahram', 
    protect, 
    registrationController.updateMahram
);

router.patch('/:id/cancel', 
    protect, 
    registrationController.cancelRegistration
);

// Admin Only Routes
router.get('/', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    registrationController.getAllRegistrations
);

router.patch('/:id/status', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    registrationController.updateRegistrationStatus
);

router.post('/:id/notes', 
    protect, 
    restrictTo('ADMIN', 'SUPERADMIN'), 
    registrationController.addRegistrationNote
);

module.exports = router; 