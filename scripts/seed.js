const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
    console.log('Connecting to database for seeding...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sanju@2004',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true 
    });

    try {
        console.log('Reading seed.sql...');
        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('Executing seed.sql...');
        await connection.query(seedSql);

        console.log('Database successfully seeded!');
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runSeed();
