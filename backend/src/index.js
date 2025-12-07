const express = require('express');
const cors = require('cors');
const path = require('path');
const salesRoutes = require('./routes/sales');
const { initDatabase } = require('./services/database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Routes
app.use('/api/sales', salesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database on startup
initDatabase()
  .then((db) => {
    db.close();
    console.log('Database initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

