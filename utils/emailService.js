const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verifikasi koneksi saat startup
const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        logger.info('Email server connection established');
        return true;
    } catch (error) {
        logger.error('Email server connection failed:', error);
        return false;
    }
};

// Template email dengan HTML untuk tampilan lebih baik
const emailTemplates = {
    REGISTRATION_STARTED: {
        subject: 'Pendaftaran Haji/Umroh Berhasil Dimulai',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Assalamu'alaikum Wr. Wb.</h2>
                
                <p>Terima kasih telah memulai pendaftaran Haji/Umroh dengan:</p>
                <ul>
                    <li>Nomor Registrasi: <strong>${data.registrationId}</strong></li>
                    <li>Paket: <strong>${data.packageName}</strong></li>
                </ul>
                
                <p>Silahkan melengkapi dokumen-dokumen yang dibutuhkan melalui website kami.</p>
                
                <p style="margin-top: 20px;">Wassalamu'alaikum Wr. Wb.</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                </p>
            </div>
        `
    },
    STATUS_UPDATED: {
        subject: 'Status Pendaftaran Diperbarui',
        text: (data) => `
            Assalamu'alaikum Wr. Wb.
            
            Status pendaftaran Anda telah diperbarui menjadi: ${data.status}
            ${data.notes ? `\nCatatan: ${data.notes}` : ''}
            
            Silahkan cek detail pendaftaran Anda di website kami.
            
            Wassalamu'alaikum Wr. Wb.
        `
    }
};

// Fungsi untuk mengirim email
exports.sendRegistrationEmail = async (to, data) => {
    try {
        const template = emailTemplates[data.type] || emailTemplates.REGISTRATION_STARTED;
        
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: to,
            subject: template.subject,
            html: template.html(data)
        });

        logger.info(`Email sent to ${to}`, {
            messageId: info.messageId,
            type: data.type
        });

        return true;
    } catch (error) {
        logger.error('Email sending error:', error);
        return false;
    }
};

// Export verify function
exports.verifyEmailConnection = verifyEmailConnection; 