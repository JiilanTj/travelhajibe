const winston = require('winston');
const { format } = winston;
const path = require('path');

// Custom levels untuk kompatibilitas dengan Baileys
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    trace: 6
};

// Format log yang akan digunakan
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Konfigurasi Winston
const logger = winston.createLogger({
    levels: levels,
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
        })
    ]
});

// Tambahkan console transport untuk development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

// Tambahkan method child yang dibutuhkan Baileys
logger.child = (opts) => {
    return {
        ...logger,
        info: (msg, ...args) => logger.info(`[${opts.class}] ${msg}`, ...args),
        debug: (msg, ...args) => logger.debug(`[${opts.class}] ${msg}`, ...args),
        warn: (msg, ...args) => logger.warn(`[${opts.class}] ${msg}`, ...args),
        error: (msg, ...args) => logger.error(`[${opts.class}] ${msg}`, ...args),
        trace: (msg, ...args) => logger.log('trace', `[${opts.class}] ${msg}`, ...args)
    };
};

// Pastikan method trace tersedia
if (!logger.trace) {
    logger.trace = (...args) => logger.log('trace', ...args);
}

module.exports = logger; 