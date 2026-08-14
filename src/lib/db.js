const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Sanju@2004',
    database: process.env.DB_NAME || 'storerate_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Executes a database query securely using connection pooling.
 * @param {string} sql - The raw SQL query with placeholders
 * @param {Array} params - The values to securely bind to placeholders
 * @returns {Promise<any>} The result of the query
 */
async function query(sql, params) {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('[DB Query]:', sql, params);
        }
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('[DB Error]:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    query
};
