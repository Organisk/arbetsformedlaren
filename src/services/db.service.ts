// Simple database service for Arbetsförmedlaren
// Uses better-sqlite3 for SQLite operations

const Database = require('better-sqlite3');
const fs = require('fs');

// Initialize database
const db = new Database('./database/arbetsformedlaren.db');

// Set pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Read and execute init SQL
const initSql = fs.readFileSync('./src/database/init.sql', 'utf-8');
db.exec(initSql);

// Export db as default - use type assertion to bypass type checking
export default db;
