require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const salesRoutes = require('./routes/sales');
const { initDatabase } = require('./services/database/db');
const { importCSVData } = require('./services/database/importData');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend access
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Retail Sales Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sales: '/api/sales',
      filters: '/api/sales/filters',
      summary: '/api/sales/summary'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/sales', salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Initialize database and start server
initDatabase()
  .then(async () => {
    console.log('Database initialized successfully');
    
    // Import CSV data on first run
    try {
      console.log('Checking if data import is needed...');
      await importCSVData();
    } catch (err) {
      console.error('CSV import failed (non-fatal):', err);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
