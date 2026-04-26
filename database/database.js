const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            gym_id TEXT NOT NULL
        )`);

        // Create Gym Status table
        db.run(`CREATE TABLE IF NOT EXISTS gym_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            capacity INTEGER DEFAULT 0,
            available_racks INTEGER DEFAULT 12
        )`);

        // Insert default gym status if empty
        db.get(`SELECT COUNT(*) as count FROM gym_status`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO gym_status (id, capacity, available_racks) VALUES (1, 42, 8)`);
            }
        });

        // Create Lockers table
        db.run(`CREATE TABLE IF NOT EXISTS lockers (
            id INTEGER PRIMARY KEY,
            type TEXT NOT NULL, -- 'mens' or 'womens'
            status TEXT DEFAULT 'available', -- 'available' or 'occupied'
            user_id INTEGER
        )`);

        // Populate lockers if empty (1-75 mens, 76-100 womens)
        db.get(`SELECT COUNT(*) as count FROM lockers`, (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare(`INSERT INTO lockers (id, type, status) VALUES (?, ?, ?)`);
                for (let i = 1; i <= 100; i++) {
                    const type = i <= 75 ? 'mens' : 'womens';
                    // Randomly occupy some lockers for realism (~30% chance)
                    const status = Math.random() < 0.3 ? 'occupied' : 'available';
                    stmt.run(i, type, status);
                }
                stmt.finalize();
            }
        });
    });
}

module.exports = db;
