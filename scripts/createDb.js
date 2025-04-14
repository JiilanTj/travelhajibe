const { Pool } = require('pg');
const logger = require('../config/logger');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const createDatabase = async () => {
    try {
        await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        logger.info('Database created successfully');
    } catch (err) {
        logger.error('Error creating database:', err);
    } finally {
        await pool.end();
    }
};

createDatabase(); 