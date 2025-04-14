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
const app = express();

// Development CORS - izinkan semua origin
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
} else {
    // Production CORS - lebih ketat
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
}

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/payments', paymentRoutes);

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

        // Start server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

initializeApp();
