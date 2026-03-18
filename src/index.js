/*
 * Basic Express server for the admin backend.
 * - Loads environment variables from .env
 * - Enables CORS + request logging
 * - Serves a simple health endpoint
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const { init } = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

init();

app.listen(PORT, () => {
  console.log(`Admin backend listening on http://localhost:${PORT}`);
});
