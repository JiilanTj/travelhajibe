const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('./logger');

const initializeSocket = (server) => {
    const io = socketIO(server);

    // Middleware untuk autentikasi socket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.email}`);
        
        // Join personal room
        socket.join(`user:${socket.user.id}`);

        // Handle disconnect
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.user.email}`);
        });
    });

    return io;
};

module.exports = initializeSocket;