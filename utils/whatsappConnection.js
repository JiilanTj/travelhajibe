const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const logger = require('../config/logger');
const path = require('path');

// Store auth info
const AUTH_FOLDER = path.join(__dirname, '../.auth');
let sock = null;

// Function to connect to WhatsApp
const connectToWhatsApp = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

        sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: logger // Sekarang logger sudah memiliki method child
        });

        // Handle connection updates
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                logger.info('WhatsApp connection closed due to:', lastDisconnect.error);
                
                if (shouldReconnect) {
                    connectToWhatsApp();
                }
            } else if (connection === 'open') {
                logger.info('WhatsApp connection opened');
            }
        });

        // Save credentials when updated
        sock.ev.on('creds.update', saveCreds);

        return sock;
    } catch (error) {
        logger.error('Error in connectToWhatsApp:', error);
        throw error;
    }
};

// Get WhatsApp socket
const getSocket = () => {
    if (!sock) {
        throw new Error('WhatsApp connection not initialized');
    }
    return sock;
};

// Initialize connection
connectToWhatsApp().catch(err => logger.error('WhatsApp connection error:', err));

module.exports = { getSocket };