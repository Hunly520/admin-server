const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// Login (returns JWT)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const row = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(username);
  if (!row) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: row.id, username: row.username, role: row.role });
  res.json({ token, user: { id: row.id, username: row.username, role: row.role } });
});

module.exports = router;
