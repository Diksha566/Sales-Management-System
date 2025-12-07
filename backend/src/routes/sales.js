const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Get sales with search, filters, sorting, and pagination
router.get('/', salesController.getSales);

// Get filter options (for populating filter dropdowns)
router.get('/filters', salesController.getFilterOptions);

// Get summary statistics
router.get('/summary', salesController.getSummary);

module.exports = router;


