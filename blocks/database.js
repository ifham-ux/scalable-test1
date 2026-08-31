const mysql = require ('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'mysql',
    password: 'Ifhamfkr050706',
    database: 'scalable_one',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;