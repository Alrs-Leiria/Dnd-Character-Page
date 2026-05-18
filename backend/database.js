const Database = require('better-sqlite3');

const db = new Database('./backend/database.db');

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("Connected to database.");

module.exports = db;
