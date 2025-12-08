const { Pool } = require('pg');

// Database connection pool
let pool;

function initDatabase() {
  return new Promise((resolve, reject) => {
    // Use DATABASE_URL from environment variable
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://render_db_3rlv_user:XSmqEX6OJTvvuFvgdBi0XEfiLOJo34RG@dpg-d4qtmi7diees739h8i90-a.virginia-postgres.render.com/render_db_3rlv';
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    pool.connect((err, client, release) => {
      if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to PostgreSQL database');
      release();

      // Create table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sales (
          transaction_id SERIAL PRIMARY KEY,
          date TEXT,
          customer_id TEXT,
          customer_name TEXT,
          phone_number TEXT,
          gender TEXT,
          age INTEGER,
          customer_region TEXT,
          customer_type TEXT,
          product_id TEXT,
          product_name TEXT,
          brand TEXT,
          product_category TEXT,
          tags TEXT,
          quantity INTEGER,
          price_per_unit DECIMAL(10, 2),
          discount_percentage DECIMAL(5, 2),
          total_amount DECIMAL(10, 2),
          final_amount DECIMAL(10, 2),
          payment_method TEXT,
          order_status TEXT,
          delivery_type TEXT,
          store_id TEXT,
          store_location TEXT,
          salesperson_id TEXT,
          employee_name TEXT
        )
      `;

      pool.query(createTableQuery, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }

        // Check if data exists
        pool.query('SELECT COUNT(*) as count FROM sales', (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          const count = parseInt(result.rows[0].count);
          if (count === 0) {
            console.log('Database is empty. Run import script to load data.');
          } else {
            console.log(`Database contains ${count} records`);
          }

          resolve(pool);
        });
      });
    });
  });
}

// Get database pool
function getDatabase() {
  return new Promise((resolve, reject) => {
    if (pool) {
      resolve(pool);
    } else {
      initDatabase().then(resolve).catch(reject);
    }
  });
}

module.exports = { initDatabase, getDatabase };
