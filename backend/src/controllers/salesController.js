const { getDatabase } = require('../services/database/db');

// Get filter options
async function getFilterOptions(req, res) {
  try {
    const db = await getDatabase();
    
    const options = {};
    
    // Get unique values for each filter
    const queries = {
      regions: 'SELECT DISTINCT customer_region FROM sales WHERE customer_region IS NOT NULL ORDER BY customer_region',
      genders: 'SELECT DISTINCT gender FROM sales WHERE gender IS NOT NULL ORDER BY gender',
      categories: 'SELECT DISTINCT product_category FROM sales WHERE product_category IS NOT NULL ORDER BY product_category',
      paymentMethods: 'SELECT DISTINCT payment_method FROM sales WHERE payment_method IS NOT NULL ORDER BY payment_method',
      tags: 'SELECT DISTINCT tags FROM sales WHERE tags IS NOT NULL AND tags != ""',
      minAge: 'SELECT MIN(age) as min FROM sales WHERE age IS NOT NULL',
      maxAge: 'SELECT MAX(age) as max FROM sales WHERE age IS NOT NULL',
      minDate: 'SELECT MIN(date) as min FROM sales WHERE date IS NOT NULL',
      maxDate: 'SELECT MAX(date) as max FROM sales WHERE date IS NOT NULL'
    };
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = Object.keys(queries).length;
      
      function checkComplete() {
        completed++;
        if (completed === total) {
          db.close();
          resolve(options);
        }
      }
      
      // Get regions
      db.all(queries.regions, [], (err, rows) => {
        if (!err) options.regions = rows.map(r => r.customer_region);
        checkComplete();
      });
      
      // Get genders
      db.all(queries.genders, [], (err, rows) => {
        if (!err) options.genders = rows.map(r => r.gender);
        checkComplete();
      });
      
      // Get categories
      db.all(queries.categories, [], (err, rows) => {
        if (!err) options.categories = rows.map(r => r.product_category);
        checkComplete();
      });
      
      // Get payment methods
      db.all(queries.paymentMethods, [], (err, rows) => {
        if (!err) options.paymentMethods = rows.map(r => r.payment_method);
        checkComplete();
      });
      
      // Get tags (flatten comma-separated values)
      db.all(queries.tags, [], (err, rows) => {
        if (!err) {
          const tagSet = new Set();
          rows.forEach(r => {
            if (r.tags) {
              r.tags.split(',').forEach(tag => tagSet.add(tag.trim()));
            }
          });
          options.tags = Array.from(tagSet).sort();
        }
        checkComplete();
      });
      
      // Get age range
      db.get(queries.minAge, [], (err, row) => {
        if (!err) options.minAge = row.min;
        checkComplete();
      });
      
      db.get(queries.maxAge, [], (err, row) => {
        if (!err) options.maxAge = row.max;
        checkComplete();
      });
      
      // Get date range
      db.get(queries.minDate, [], (err, row) => {
        if (!err) options.minDate = row.min;
        checkComplete();
      });
      
      db.get(queries.maxDate, [], (err, row) => {
        if (!err) options.maxDate = row.max;
        checkComplete();
      });
    }).then(options => {
      res.json(options);
    }).catch(err => {
      console.error('Error getting filter options:', err);
      res.status(500).json({ error: 'Failed to get filter options' });
    });
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get sales with search, filters, sorting, and pagination
async function getSales(req, res) {
  try {
    const db = await getDatabase();
    
    // Extract query parameters
    const {
      search = '',
      regions = '',
      genders = '',
      ageMin = '',
      ageMax = '',
      categories = '',
      tags = '',
      paymentMethods = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'date',
      sortOrder = 'DESC',
      page = 1,
      pageSize = 10
    } = req.query;
    
    // Build WHERE clause
    const conditions = [];
    const params = [];
    
    // Search (Customer Name or Phone Number)
    if (search) {
      conditions.push(`(customer_name LIKE ? OR phone_number LIKE ?)`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Region filter (multi-select)
    if (regions) {
      const regionList = regions.split(',').filter(r => r);
      if (regionList.length > 0) {
        const placeholders = regionList.map(() => '?').join(',');
        conditions.push(`customer_region IN (${placeholders})`);
        params.push(...regionList);
      }
    }
    
    // Gender filter (multi-select)
    if (genders) {
      const genderList = genders.split(',').filter(g => g);
      if (genderList.length > 0) {
        const placeholders = genderList.map(() => '?').join(',');
        conditions.push(`gender IN (${placeholders})`);
        params.push(...genderList);
      }
    }
    
    // Age range filter (with validation)
    if (ageMin) {
      const minAge = parseInt(ageMin);
      if (!isNaN(minAge) && minAge >= 0) {
        conditions.push(`age >= ?`);
        params.push(minAge);
      }
    }
    if (ageMax) {
      const maxAge = parseInt(ageMax);
      if (!isNaN(maxAge) && maxAge >= 0) {
        conditions.push(`age <= ?`);
        params.push(maxAge);
      }
    }
    
    // Validate age range (min should be <= max if both provided)
    if (ageMin && ageMax) {
      const minAge = parseInt(ageMin);
      const maxAge = parseInt(ageMax);
      if (!isNaN(minAge) && !isNaN(maxAge) && minAge > maxAge) {
        return res.status(400).json({ error: 'Invalid age range: minimum age cannot be greater than maximum age' });
      }
    }
    
    // Category filter (multi-select)
    if (categories) {
      const categoryList = categories.split(',').filter(c => c);
      if (categoryList.length > 0) {
        const placeholders = categoryList.map(() => '?').join(',');
        conditions.push(`product_category IN (${placeholders})`);
        params.push(...categoryList);
      }
    }
    
    // Tags filter (multi-select)
    if (tags) {
      const tagList = tags.split(',').filter(t => t);
      if (tagList.length > 0) {
        const tagConditions = tagList.map(() => `tags LIKE ?`);
        conditions.push(`(${tagConditions.join(' OR ')})`);
        tagList.forEach(tag => params.push(`%${tag}%`));
      }
    }
    
    // Payment method filter (multi-select)
    if (paymentMethods) {
      const paymentList = paymentMethods.split(',').filter(p => p);
      if (paymentList.length > 0) {
        const placeholders = paymentList.map(() => '?').join(',');
        conditions.push(`payment_method IN (${placeholders})`);
        params.push(...paymentList);
      }
    }
    
    // Date range filter (with validation)
    if (dateFrom) {
      // Validate date format
      if (isNaN(Date.parse(dateFrom))) {
        return res.status(400).json({ error: 'Invalid date format for dateFrom' });
      }
      conditions.push(`date >= ?`);
      params.push(dateFrom);
    }
    if (dateTo) {
      // Validate date format
      if (isNaN(Date.parse(dateTo))) {
        return res.status(400).json({ error: 'Invalid date format for dateTo' });
      }
      conditions.push(`date <= ?`);
      params.push(dateTo);
    }
    
    // Validate date range (from should be <= to if both provided)
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      if (fromDate > toDate) {
        return res.status(400).json({ error: 'Invalid date range: start date cannot be after end date' });
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Validate sortBy and sortOrder
    const validSortFields = {
      'date': 'date',
      'quantity': 'quantity',
      'customer_name': 'customer_name'
    };
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortField = validSortFields[sortBy] || 'date';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM sales ${whereClause}`;
    
    // Validate pagination parameters
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }
    
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({ error: 'Invalid page size (must be between 1 and 100)' });
    }
    
    // Build main query
    const offset = (pageNum - 1) * pageSizeNum;
    const query = `
      SELECT * FROM sales 
      ${whereClause}
      ORDER BY ${sortField} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;
    
    return new Promise((resolve, reject) => {
      // Get total count
      db.get(countQuery, params, (err, countRow) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        
        const total = countRow.total;
        const totalPages = Math.ceil(total / parseInt(pageSize));
        
        // Get paginated results
        db.all(query, [...params, pageSizeNum, offset], (err, rows) => {
          db.close();
          
          if (err) {
            reject(err);
            return;
          }
          
          // Handle null/undefined values in response
          const sanitizedRows = rows.map(row => {
            const sanitized = {};
            Object.keys(row).forEach(key => {
              sanitized[key] = row[key] !== null && row[key] !== undefined ? row[key] : null;
            });
            return sanitized;
          });
          
          resolve({
            data: sanitizedRows,
            pagination: {
              page: pageNum,
              pageSize: pageSizeNum,
              total,
              totalPages
            }
          });
        });
      });
    }).then(result => {
      res.json(result);
    }).catch(err => {
      console.error('Error getting sales:', err);
      res.status(500).json({ error: 'Failed to get sales data' });
    });
  } catch (error) {
    console.error('Error in getSales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get summary statistics based on current filters
async function getSummary(req, res) {
  try {
    const db = await getDatabase();
    
    // Extract query parameters (same as getSales)
    const {
      search = '',
      regions = '',
      genders = '',
      ageMin = '',
      ageMax = '',
      categories = '',
      tags = '',
      paymentMethods = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    // Build WHERE clause (same logic as getSales)
    const conditions = [];
    const params = [];
    
    if (search) {
      conditions.push(`(customer_name LIKE ? OR phone_number LIKE ?)`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (regions) {
      const regionList = regions.split(',').filter(r => r);
      if (regionList.length > 0) {
        const placeholders = regionList.map(() => '?').join(',');
        conditions.push(`customer_region IN (${placeholders})`);
        params.push(...regionList);
      }
    }
    
    if (genders) {
      const genderList = genders.split(',').filter(g => g);
      if (genderList.length > 0) {
        const placeholders = genderList.map(() => '?').join(',');
        conditions.push(`gender IN (${placeholders})`);
        params.push(...genderList);
      }
    }
    
    if (ageMin) {
      const minAge = parseInt(ageMin);
      if (!isNaN(minAge) && minAge >= 0) {
        conditions.push(`age >= ?`);
        params.push(minAge);
      }
    }
    if (ageMax) {
      const maxAge = parseInt(ageMax);
      if (!isNaN(maxAge) && maxAge >= 0) {
        conditions.push(`age <= ?`);
        params.push(maxAge);
      }
    }
    
    if (categories) {
      const categoryList = categories.split(',').filter(c => c);
      if (categoryList.length > 0) {
        const placeholders = categoryList.map(() => '?').join(',');
        conditions.push(`product_category IN (${placeholders})`);
        params.push(...categoryList);
      }
    }
    
    if (tags) {
      const tagList = tags.split(',').filter(t => t);
      if (tagList.length > 0) {
        const tagConditions = tagList.map(() => `tags LIKE ?`);
        conditions.push(`(${tagConditions.join(' OR ')})`);
        tagList.forEach(tag => params.push(`%${tag}%`));
      }
    }
    
    if (paymentMethods) {
      const paymentList = paymentMethods.split(',').filter(p => p);
      if (paymentList.length > 0) {
        const placeholders = paymentList.map(() => '?').join(',');
        conditions.push(`payment_method IN (${placeholders})`);
        params.push(...paymentList);
      }
    }
    
    if (dateFrom) {
      if (!isNaN(Date.parse(dateFrom))) {
        conditions.push(`date >= ?`);
        params.push(dateFrom);
      }
    }
    if (dateTo) {
      if (!isNaN(Date.parse(dateTo))) {
        conditions.push(`date <= ?`);
        params.push(dateTo);
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get summary statistics
    const summaryQuery = `
      SELECT 
        SUM(quantity) as total_units,
        SUM(final_amount) as total_amount,
        SUM(total_amount - final_amount) as total_discount,
        COUNT(*) as total_records
      FROM sales 
      ${whereClause}
    `;
    
    return new Promise((resolve, reject) => {
      db.get(summaryQuery, params, (err, row) => {
        db.close();
        
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          totalUnits: row.total_units || 0,
          totalAmount: row.total_amount || 0,
          totalDiscount: row.total_discount || 0,
          totalRecords: row.total_records || 0
        });
      });
    }).then(summary => {
      res.json(summary);
    }).catch(err => {
      console.error('Error getting summary:', err);
      res.status(500).json({ error: 'Failed to get summary statistics' });
    });
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getSales,
  getFilterOptions,
  getSummary
};

