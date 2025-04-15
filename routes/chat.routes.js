const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');
const upload = require('../config/chatUpload');

// Protect all chat routes
router.use(protect);

// Conversations
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.startConversation);

// Messages
router.get('/messages/:roomId', chatController.getMessages);

// Broadcast (Admin only)
router.post('/broadcast',
    restrictTo('ADMIN', 'SUPERADMIN'),
    upload.single('attachment'),
    chatController.sendBroadcast
);

module.exports = router;