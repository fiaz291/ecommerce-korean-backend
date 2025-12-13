const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializePrisma } = require('./config/prisma');
const prisma = initializePrisma(); // Initialize Prisma ONCE

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// ----------------------
// Middleware
// ----------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Health Check
// ----------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// ----------------------
// API Routes
// ----------------------
app.use('/api', require('./routes'));

// ----------------------
// Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    code: err.status || 500,
    status: false,
    error: err.message || 'Internal Server Error',
    data: null,
  });
});

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    status: false,
    error: 'Route not found',
    data: null,
  });
});

// ----------------------
// Start Server
// ----------------------
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// ----------------------
// Graceful Shutdown
// ----------------------
async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
