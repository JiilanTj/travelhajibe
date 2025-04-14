const { getSocket } = require('./whatsappConnection');
const logger = require('../config/logger');

// Template pesan WhatsApp
const whatsappTemplates = {
    REGISTRATION_STARTED: (data) => `
        Assalamu'alaikum Wr. Wb.
        
        Terima kasih telah memulai pendaftaran Haji/Umroh dengan nomor registrasi: ${data.registrationId}
        
        Silahkan melengkapi dokumen-dokumen yang dibutuhkan melalui website kami.
        
        Wassalamu'alaikum Wr. Wb.
    `,
    STATUS_UPDATED: (data) => `
        Assalamu'alaikum Wr. Wb.
        
        Status pendaftaran Anda telah diperbarui menjadi: ${data.status}
        ${data.notes ? `\nCatatan: ${data.notes}` : ''}
        
        Silahkan cek detail pendaftaran Anda di website kami.
        
        Wassalamu'alaikum Wr. Wb.
    `
};

// Format nomor telepon
const formatPhoneNumber = (phone) => {
    // Remove any non-numeric characters
    let number = phone.replace(/\D/g, '');
    
    // Remove leading 0 if exists
    if (number.startsWith('0')) {
        number = number.substring(1);
    }
    
    // Add country code if not exists
    if (!number.startsWith('62')) {
        number = '62' + number;
    }
    
    // Add @s.whatsapp.net for Baileys
    return number + '@s.whatsapp.net';
};

// Fungsi untuk mengirim notifikasi WhatsApp
exports.sendWhatsAppNotification = async (to, data) => {
    try {
        const sock = getSocket();
        const formattedNumber = formatPhoneNumber(to);
        const template = whatsappTemplates[data.type];

        if (!template) {
            throw new Error(`Template ${data.type} not found`);
        }

        const message = template(data);

        await sock.sendMessage(formattedNumber, { 
            text: message 
        });

        logger.info(`WhatsApp sent to ${to}`, {
            type: data.type,
            to: formattedNumber
        });
    } catch (error) {
        logger.error('WhatsApp sending error:', error);
        // Don't throw error to prevent breaking the main flow
    }
};

// Fungsi untuk cek status koneksi
exports.checkConnection = () => {
    try {
        const sock = getSocket();
        return sock?.user?.id ? true : false;
    } catch {
        return false;
    }
}; 