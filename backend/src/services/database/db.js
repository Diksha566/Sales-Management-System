const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'sales.db');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create table
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS sales (
          transaction_id INTEGER PRIMARY KEY,
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
          price_per_unit REAL,
          discount_percentage REAL,
          total_amount REAL,
          final_amount REAL,
          payment_method TEXT,
          order_status TEXT,
          delivery_type TEXT,
          store_id TEXT,
          store_location TEXT,
          salesperson_id TEXT,
          employee_name TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        
        // Check if data exists
        db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (row.count === 0) {
            console.log('Database is empty. Run import script to load data.');
          } else {
            console.log(`Database contains ${row.count} records`);
          }
          
          resolve(db);
        });
      });
    });
  });
}

// Get database instance
function getDatabase() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(DB_PATH)) {
      const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(db);
      });
    } else {
      initDatabase().then(resolve).catch(reject);
    }
  });
}

module.exports = { initDatabase, getDatabase };


