const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getDatabase } = require('./db');

async function importCSVData() {
  try {
    const pool = await getDatabase();
    
    // Check if data already exists
    const checkResult = await pool.query('SELECT COUNT(*) as count FROM sales');
    const count = parseInt(checkResult.rows[0].count);
    
    if (count > 0) {
      console.log(`Database already has ${count} records. Skipping import.`);
      return;
    }
    
    console.log('Starting CSV import...');
    
    const csvPath = path.join(__dirname, '../../../truestate_assignment_dataset.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      return;
    }
    
    const rows = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', async () => {
          console.log(`Parsed ${rows.length} rows from CSV`);
          
          let imported = 0;
          
          for (const row of rows) {
            try {
              await pool.query(`
                INSERT INTO sales (
                  transaction_id, date, customer_id, customer_name, phone_number,
                  gender, age, customer_region, customer_type, product_id,
                  product_name, brand, product_category, tags, quantity,
                  price_per_unit, discount_percentage, total_amount, final_amount,
                  payment_method, order_status, delivery_type, store_id,
                  store_location, salesperson_id, employee_name
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
                ON CONFLICT (transaction_id) DO NOTHING
              `, [
                row['Transaction ID'],
                row['Date'],
                row['Customer ID'],
                row['Customer Name'],
                row['Phone Number'],
                row['Gender'],
                parseInt(row['Age']) || 0,
                row['Customer Region'],
                row['Customer Type'],
                row['Product ID'],
                row['Product Name'],
                row['Brand'],
                row['Product Category'],
                row['Tags'],
                parseInt(row['Quantity']) || 0,
                parseFloat(row['Price per Unit']) || 0,
                parseFloat(row['Discount Percentage']) || 0,
                parseFloat(row['Total Amount']) || 0,
                parseFloat(row['Final Amount']) || 0,
                row['Payment Method'],
                row['Order Status'],
                row['Delivery Type'],
                row['Store ID'],
                row['Store Location'],
                row['Salesperson ID'],
                row['Employee Name']
              ]);
              
              imported++;
            } catch (err) {
              console.error(`Error importing row ${row['Transaction ID']}:`, err.message);
            }
          }
          
          console.log(`✅ Successfully imported ${imported} records!`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

module.exports = { importCSVData };
