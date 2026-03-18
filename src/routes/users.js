const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, (req, res) => {
  const row = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: row });
});

// List users (admin only)
router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const rows = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY id DESC').all();
  res.json({ users: rows });
});

// Create user (admin only)
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { username, password, role = 'user' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, passwordHash, role);
    const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'username already exists' });
    }
    throw err;
  }
});

module.exports = router;
