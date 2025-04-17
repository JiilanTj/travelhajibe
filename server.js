const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const logger = require('./config/logger');
const { syncModels } = require('./models');
const authRoutes = require('./routes/auth.routes');
const packageRoutes = require('./routes/package.routes');
const db = require('./config/database');
const registrationRoutes = require('./routes/registration.routes');
const documentRoutes = require('./routes/document.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const commissionRoutes = require('./routes/commission.routes');
const paymentRoutes = require('./routes/payment.routes');
const { verifyEmailConnection } = require('./utils/emailService');
const agentsRoutes = require('./routes/agents.routes');
const financeRoutes = require('./routes/finance.routes');
const chatRoutes = require('./routes/chat.routes');
const initializeSocket = require('./config/socket');
const http = require('http');
const app = express();

// Development CORS - izinkan semua origin
app.use(cors({
    origin: [
      'http://localhost:3001',
      'https://portal.palvis.my.id',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  }));

// Morgan middleware untuk HTTP request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use('/uploads/documents', express.static('public/uploads/documents'));
app.use('/uploads/packages', express.static('public/uploads/packages'));
app.use('/uploads/payments', express.static('public/uploads/payments'));
app.use('/uploads/chat', express.static('public/uploads/chat'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/chat', chatRoutes);

// Base API route
app.get('/api/', (req, res) => {
    logger.info('Base API endpoint accessed');
    res.json({
        status: "API IS RUNNING",
        message: "success"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const initializeApp = async () => {
    try {
        // Verify email connection
        const emailConnected = await verifyEmailConnection();
        if (!emailConnected) {
            logger.warn('Email service not properly configured');
        }

        // Sync database
        await db.sync();
        logger.info('Database synchronized');

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        const io = initializeSocket(server);
        
        // Make io accessible in routes
        app.set('io', io);

        // Start server with Socket.IO
        server.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info('Socket.IO initialized');
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

initializeApp();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
    });
});
