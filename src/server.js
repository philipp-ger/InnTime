const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// .env laden (für lokale Entwicklung)
try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

const app = express();
const PORT = process.env.PORT || 3000;

// Database init (side effect)
require('./db/database');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api', employeeRoutes);
app.use('/api/admin', adminRoutes);

// Handle React Router - all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║          InnTime läuft auf Port ${PORT}           ║
║  http://0.0.0.0:${PORT}                         ║
║                                                ║
║  API Modularisiert & Optimiert                 ║
╚════════════════════════════════════════════════╝
    `);
});
