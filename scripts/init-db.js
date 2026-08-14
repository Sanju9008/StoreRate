const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runInit() {
    console.log('Connecting to database for initialization...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sanju@2004',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true 
    });

    try {
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schemaSql);
        
        console.log('Database schema successfully initialized!');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runInit();
