const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/data.sqlite');

const db = new Database(DB_PATH);

// Ensure the necessary tables exist
const init = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Optionally seed an initial admin user when provided via env vars.
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminUser && adminPass) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUser);
    if (!existing) {
      const passwordHash = bcrypt.hashSync(adminPass, 10);
      db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
        .run(adminUser, passwordHash, 'admin');
      console.log(`Seeded admin user: ${adminUser}`);
    }
  }
};

module.exports = {
  db,
  init,
};
