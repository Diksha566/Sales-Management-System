const csv = require('csv-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const CSV_PATH = path.join(__dirname, '../../../truestate_assignment_dataset.csv');
const DB_PATH = path.join(__dirname, 'sales.db');

function importCSV() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    // Clear existing data
    db.run('DELETE FROM sales', (err) => {
      if (err) {
        console.error('Error clearing table:', err);
        reject(err);
        return;
      }
      
      console.log('Starting CSV import...');
      let count = 0;
      const batch = [];
      const BATCH_SIZE = 1000;
      
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
          batch.push([
            row['Transaction ID'],
            row['Date'],
            row['Customer ID'],
            row['Customer Name'],
            row['Phone Number'],
            row['Gender'],
            row['Age'],
            row['Customer Region'],
            row['Customer Type'],
            row['Product ID'],
            row['Product Name'],
            row['Brand'],
            row['Product Category'],
            row['Tags'],
            row['Quantity'],
            row['Price per Unit'],
            row['Discount Percentage'],
            row['Total Amount'],
            row['Final Amount'],
            row['Payment Method'],
            row['Order Status'],
            row['Delivery Type'],
            row['Store ID'],
            row['Store Location'],
            row['Salesperson ID'],
            row['Employee Name']
          ]);
          
          if (batch.length >= BATCH_SIZE) {
            insertBatch(db, batch.splice(0, BATCH_SIZE), count);
            count += BATCH_SIZE;
          }
        })
        .on('end', () => {
          if (batch.length > 0) {
            insertBatch(db, batch, count).then(() => {
              console.log(`Import complete. Total records: ${count + batch.length}`);
              db.close();
              resolve();
            });
          } else {
            console.log(`Import complete. Total records: ${count}`);
            db.close();
            resolve();
          }
        })
        .on('error', (err) => {
          console.error('Error reading CSV:', err);
          db.close();
          reject(err);
        });
    });
  });
}

function insertBatch(db, batch, offset) {
  return new Promise((resolve, reject) => {
    const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
    const values = batch.flat();
    
    db.run(
      `INSERT INTO sales VALUES ${placeholders}`,
      values,
      function(err) {
        if (err) {
          console.error('Error inserting batch:', err);
          reject(err);
          return;
        }
        if (offset % 10000 === 0) {
          console.log(`Imported ${offset} records...`);
        }
        resolve();
      }
    );
  });
}

// Run import if called directly
if (require.main === module) {
  importCSV()
    .then(() => {
      console.log('CSV import completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('CSV import failed:', err);
      process.exit(1);
    });
}

module.exports = { importCSV };


