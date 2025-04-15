const { ChatRoom, ChatMember, Message, User } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const { getFullUrl } = require('../utils/urlHelper');

// Get conversations list
exports.getConversations = async (req, res) => {
    try {
        const chatMembers = await ChatMember.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: ChatRoom,
                    include: [
                        {
                            model: Message,
                            limit: 1,
                            order: [['createdAt', 'DESC']],
                        },
                        {
                            model: ChatMember,
                            include: [
                                {
                                    model: User,
                                    attributes: ['id', 'fullname', 'email', 'role']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        const conversations = chatMembers.map(member => {
            const room = member.ChatRoom;
            const otherMember = room.ChatMembers.find(m => m.userId !== req.user.id);
            const lastMessage = room.Messages[0];

            return {
                id: room.id,
                type: room.type,
                otherUser: otherMember ? otherMember.User : null,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    type: lastMessage.type,
                    createdAt: lastMessage.createdAt
                } : null,
                lastReadAt: member.lastReadAt
            };
        });

        res.json({
            status: 'success',
            data: { conversations }
        });
    } catch (error) {
        logger.error('Get conversations error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching conversations'
        });
    }
};

// Start new conversation
exports.startConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        // Verify target user exists
        const targetUser = await User.findByPk(userId);
        if (!targetUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if conversation already exists
        const existingRoom = await ChatRoom.findOne({
            include: [{
                model: ChatMember,
                where: {
                    userId: {
                        [Op.in]: [req.user.id, userId]
                    }
                },
                group: ['roomId'],
                having: Sequelize.literal('COUNT(DISTINCT userId) = 2')
            }],
            where: {
                type: 'PRIVATE'
            }
        });

        if (existingRoom) {
            return res.json({
                status: 'success',
                data: { roomId: existingRoom.id }
            });
        }

        // Create new room
        const room = await ChatRoom.create({
            type: 'PRIVATE'
        });

        // Add members
        await ChatMember.bulkCreate([
            { roomId: room.id, userId: req.user.id },
            { roomId: room.id, userId: userId }
        ]);

        res.status(201).json({
            status: 'success',
            data: { roomId: room.id }
        });
    } catch (error) {
        logger.error('Start conversation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error starting conversation'
        });
    }
};

// Get messages from a room
exports.sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { content, type = 'TEXT' } = req.body;
        const file = req.file;

        // Verify user is member of room
        const member = await ChatMember.findOne({
            where: {
                roomId,
                userId: req.user.id
            }
        });

        if (!member) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Create message
        const message = await Message.create({
            roomId,
            senderId: req.user.id,
            type,
            content,
            attachmentUrl: file ? `/uploads/chat/${file.filename}` : null
        });

        // Update room lastMessageAt
        await ChatRoom.update(
            { lastMessageAt: new Date() },
            { where: { id: roomId } }
        );

        // Get sender info for response
        const sender = await User.findByPk(req.user.id, {
            attributes: ['id', 'fullname', 'email', 'role']
        });

        const messageData = {
            id: message.id,
            roomId,
            content: message.content,
            type: message.type,
            attachmentUrl: message.attachmentUrl,
            createdAt: message.createdAt,
            sender
        };

        // Emit to all members of the room except sender
        const roomMembers = await ChatMember.findAll({
            where: { 
                roomId,
                userId: { [Op.ne]: req.user.id }
            }
        });

        const io = req.app.get('io');
        roomMembers.forEach(member => {
            io.to(`user:${member.userId}`).emit('private_message', messageData);
        });

        res.status(201).json({
            status: 'success',
            data: messageData
        });
    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error sending message'
        });
    }
};

// Send broadcast message (Admin only)
exports.sendBroadcast = async (req, res) => {
    try {
        const { content, type = 'TEXT' } = req.body;
        const file = req.file;

        // Create broadcast room
        const room = await ChatRoom.create({
            type: 'BROADCAST'
        });

        // Create message
        const message = await Message.create({
            roomId: room.id,
            senderId: req.user.id,
            type,
            content,
            attachmentUrl: file ? `/uploads/chat/${file.filename}` : null
        });

        // Emit to all connected users
        req.app.get('io').emit('broadcast_message', {
            id: message.id,
            content: message.content,
            type: message.type,
            attachmentUrl: message.attachmentUrl ? 
                getFullUrl(req, message.attachmentUrl) : null,
            sender: {
                id: req.user.id,
                fullname: req.user.fullname,
                role: req.user.role
            },
            createdAt: message.createdAt
        });

        res.status(201).json({
            status: 'success',
            message: 'Broadcast sent successfully'
        });
    } catch (error) {
        logger.error('Send broadcast error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error sending broadcast'
        });
    }
};