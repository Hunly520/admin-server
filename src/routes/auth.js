const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, signToken } = require('../middleware/auth');

const router = express.Router();

// Protect login endpoint from brute-force.
const loginLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 8, // limit each IP to 8 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Login (returns JWT)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // 查询用户
    const row = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(username);
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 校验密码
    const passwordMatch = await bcrypt.compare(password, row.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 生成JWT
    const expiresIn = rememberMe ? '7d' : undefined;
    const token = signToken({ id: row.id, username: row.username, role: row.role }, { expiresIn });

    // 返回token和用户信息
    res.json({ token, user: { id: row.id, username: row.username, role: row.role } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // 检查用户是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hashedPassword);
    const userId = result.lastInsertRowid;

    // 返回成功响应
    res.status(201).json({ id: userId, username });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token (returns new JWT)
router.post('/refresh', authenticate, (req, res) => {
  const { id, username, role } = req.user;
  const token = signToken({ id, username, role });
  res.json({ token, user: { id, username, role } });
});

module.exports = router;
