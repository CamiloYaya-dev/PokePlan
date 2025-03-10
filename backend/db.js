const Database = require('better-sqlite3');

const db = new Database(':memory:');

function initializeDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tablero (
            id TEXT PRIMARY KEY,
            num_cards INTEGER,
            code TEXT,
            owner_votes INTEGER,
            auto_close INTEGER,
            owner TEXT,
            status INTEGER
        )
    `);
    console.log("📌 Base de datos SQLite en memoria inicializada.");
}

module.exports = { db, initializeDB };
