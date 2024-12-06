const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS spins (id INTEGER PRIMARY KEY, spins INTEGER, balance INTEGER, averageSpinPrice REAL)");
});

module.exports = db;