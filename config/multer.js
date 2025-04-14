const multer = require('multer');
const path = require('path');
const logger = require('./logger');

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/packages');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'package-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file yang diizinkan
const fileFilter = (req, file, cb) => {
    // Daftar mime types yang diizinkan
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG & WEBP files are allowed.'), false);
    }
};

// Konfigurasi multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Error handler untuk multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'File too large. Maximum size is 2MB'
            });
        }
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    
    next(err);
};

module.exports = {
    upload,
    handleMulterError
}; 