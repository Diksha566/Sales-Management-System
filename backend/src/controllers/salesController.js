const { getDatabase } = require('../services/database/db');

// Get filter options
async function getFilterOptions(req, res) {
  try {
    const pool = await getDatabase();
    
    const options = {};
    
    // Get all filter options in parallel
    const [regions, genders, categories, paymentMethods, tags, ageRange, dateRange] = await Promise.all([
      pool.query('SELECT DISTINCT customer_region FROM sales WHERE customer_region IS NOT NULL ORDER BY customer_region'),
      pool.query('SELECT DISTINCT gender FROM sales WHERE gender IS NOT NULL ORDER BY gender'),
      pool.query('SELECT DISTINCT product_category FROM sales WHERE product_category IS NOT NULL ORDER BY product_category'),
      pool.query('SELECT DISTINCT payment_method FROM sales WHERE payment_method IS NOT NULL ORDER BY payment_method'),
      pool.query('SELECT DISTINCT tags FROM sales WHERE tags IS NOT NULL AND tags != \'\''),
      pool.query('SELECT MIN(age) as min, MAX(age) as max FROM sales WHERE age IS NOT NULL'),
      pool.query('SELECT MIN(date) as min, MAX(date) as max FROM sales WHERE date IS NOT NULL')
    ]);
    
    // Process results
    options.regions = regions.rows.map(r => r.customer_region);
    options.genders = genders.rows.map(r => r.gender);
    options.categories = categories.rows.map(r => r.product_category);
    options.paymentMethods = paymentMethods.rows.map(r => r.payment_method);
    
    // Process tags (split comma-separated values)
    const tagSet = new Set();
    tags.rows.forEach(r => {
      if (r.tags) {
        r.tags.split(',').forEach(tag => tagSet.add(tag.trim()));
      }
    });
    options.tags = Array.from(tagSet).sort();
    
    options.minAge = ageRange.rows[0].min;
    options.maxAge = ageRange.rows[0].max;
    options.minDate = dateRange.rows[0].min;
    options.maxDate = dateRange.rows[0].max;
    
    res.json(options);
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ error: 'Failed to get filter options' });
  }
}

// Get sales with search, filters, sorting, and pagination
async function getSales(req, res) {
  try {
    const pool = await getDatabase();
    
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
    let paramCounter = 1;
    
    // Search (Customer Name or Phone Number)
    if (search) {
      conditions.push(`(customer_name ILIKE $${paramCounter} OR phone_number ILIKE $${paramCounter + 1})`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      paramCounter += 2;
    }
    
    // Region filter (multi-select)
    if (regions) {
      const regionList = regions.split(',').filter(r => r);
      if (regionList.length > 0) {
        const placeholders = regionList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`customer_region IN (${placeholders})`);
        params.push(...regionList);
        paramCounter += regionList.length;
      }
    }
    
    // Gender filter (multi-select)
    if (genders) {
      const genderList = genders.split(',').filter(g => g);
      if (genderList.length > 0) {
        const placeholders = genderList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`gender IN (${placeholders})`);
        params.push(...genderList);
        paramCounter += genderList.length;
      }
    }
    
    // Age range filter
    if (ageMin) {
      const minAge = parseInt(ageMin);
      if (!isNaN(minAge) && minAge >= 0) {
        conditions.push(`age >= $${paramCounter}`);
        params.push(minAge);
        paramCounter++;
      }
    }
    if (ageMax) {
      const maxAge = parseInt(ageMax);
      if (!isNaN(maxAge) && maxAge >= 0) {
        conditions.push(`age <= $${paramCounter}`);
        params.push(maxAge);
        paramCounter++;
      }
    }
    
    // Category filter (multi-select)
    if (categories) {
      const categoryList = categories.split(',').filter(c => c);
      if (categoryList.length > 0) {
        const placeholders = categoryList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`product_category IN (${placeholders})`);
        params.push(...categoryList);
        paramCounter += categoryList.length;
      }
    }
    
    // Tags filter (multi-select)
    if (tags) {
      const tagList = tags.split(',').filter(t => t);
      if (tagList.length > 0) {
        const tagConditions = tagList.map((_, i) => `tags ILIKE $${paramCounter + i}`);
        conditions.push(`(${tagConditions.join(' OR ')})`);
        tagList.forEach(tag => params.push(`%${tag}%`));
        paramCounter += tagList.length;
      }
    }
    
    // Payment method filter (multi-select)
    if (paymentMethods) {
      const paymentList = paymentMethods.split(',').filter(p => p);
      if (paymentList.length > 0) {
        const placeholders = paymentList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`payment_method IN (${placeholders})`);
        params.push(...paymentList);
        paramCounter += paymentList.length;
      }
    }
    
    // Date range filter
    if (dateFrom) {
      if (!isNaN(Date.parse(dateFrom))) {
        conditions.push(`date >= $${paramCounter}`);
        params.push(dateFrom);
        paramCounter++;
      }
    }
    if (dateTo) {
      if (!isNaN(Date.parse(dateTo))) {
        conditions.push(`date <= $${paramCounter}`);
        params.push(dateTo);
        paramCounter++;
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
    
    // Validate pagination
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }
    
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({ error: 'Invalid page size (must be between 1 and 100)' });
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM sales ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSizeNum);
    
    // Build main query
    const offset = (pageNum - 1) * pageSizeNum;
    const query = `
      SELECT * FROM sales 
      ${whereClause}
      ORDER BY ${sortField} ${validSortOrder}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    const result = await pool.query(query, [...params, pageSizeNum, offset]);
    
    res.json({
      data: result.rows,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting sales:', error);
    res.status(500).json({ error: 'Failed to get sales data' });
  }
}

// Get summary statistics based on current filters
async function getSummary(req, res) {
  try {
    const pool = await getDatabase();
    
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
    let paramCounter = 1;
    
    if (search) {
      conditions.push(`(customer_name ILIKE $${paramCounter} OR phone_number ILIKE $${paramCounter + 1})`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      paramCounter += 2;
    }
    
    if (regions) {
      const regionList = regions.split(',').filter(r => r);
      if (regionList.length > 0) {
        const placeholders = regionList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`customer_region IN (${placeholders})`);
        params.push(...regionList);
        paramCounter += regionList.length;
      }
    }
    
    if (genders) {
      const genderList = genders.split(',').filter(g => g);
      if (genderList.length > 0) {
        const placeholders = genderList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`gender IN (${placeholders})`);
        params.push(...genderList);
        paramCounter += genderList.length;
      }
    }
    
    if (ageMin) {
      const minAge = parseInt(ageMin);
      if (!isNaN(minAge) && minAge >= 0) {
        conditions.push(`age >= $${paramCounter}`);
        params.push(minAge);
        paramCounter++;
      }
    }
    if (ageMax) {
      const maxAge = parseInt(ageMax);
      if (!isNaN(maxAge) && maxAge >= 0) {
        conditions.push(`age <= $${paramCounter}`);
        params.push(maxAge);
        paramCounter++;
      }
    }
    
    if (categories) {
      const categoryList = categories.split(',').filter(c => c);
      if (categoryList.length > 0) {
        const placeholders = categoryList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`product_category IN (${placeholders})`);
        params.push(...categoryList);
        paramCounter += categoryList.length;
      }
    }
    
    if (tags) {
      const tagList = tags.split(',').filter(t => t);
      if (tagList.length > 0) {
        const tagConditions = tagList.map((_, i) => `tags ILIKE $${paramCounter + i}`);
        conditions.push(`(${tagConditions.join(' OR ')})`);
        tagList.forEach(tag => params.push(`%${tag}%`));
        paramCounter += tagList.length;
      }
    }
    
    if (paymentMethods) {
      const paymentList = paymentMethods.split(',').filter(p => p);
      if (paymentList.length > 0) {
        const placeholders = paymentList.map((_, i) => `$${paramCounter + i}`).join(',');
        conditions.push(`payment_method IN (${placeholders})`);
        params.push(...paymentList);
        paramCounter += paymentList.length;
      }
    }
    
    if (dateFrom) {
      if (!isNaN(Date.parse(dateFrom))) {
        conditions.push(`date >= $${paramCounter}`);
        params.push(dateFrom);
        paramCounter++;
      }
    }
    if (dateTo) {
      if (!isNaN(Date.parse(dateTo))) {
        conditions.push(`date <= $${paramCounter}`);
        params.push(dateTo);
        paramCounter++;
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(quantity), 0) as total_units,
        COALESCE(SUM(final_amount), 0) as total_amount,
        COALESCE(SUM(total_amount - final_amount), 0) as total_discount,
        COUNT(*) as total_records
      FROM sales 
      ${whereClause}
    `;
    
    const result = await pool.query(summaryQuery, params);
    const row = result.rows[0];
    
    res.json({
      totalUnits: parseInt(row.total_units) || 0,
      totalAmount: parseFloat(row.total_amount) || 0,
      totalDiscount: parseFloat(row.total_discount) || 0,
      totalRecords: parseInt(row.total_records) || 0
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary statistics' });
  }
}

module.exports = {
  getSales,
  getFilterOptions,
  getSummary
};
