const mysql = require ('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "mysql",
    password: process.env.DB_password,
    database: process.env.DB_HOST || "scalable_one",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;