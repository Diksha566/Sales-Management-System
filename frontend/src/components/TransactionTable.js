import React from 'react';
import './TransactionTable.css';

function TransactionTable({ sales, loading }) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }
  
  if (sales.length === 0) {
    return (
      <div className="table-container">
        <div className="no-results">
          <p>No sales records found.</p>
          <p className="no-results-hint">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (amount) => {
    if (!amount) return '₹ 0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const formatPhone = (phone) => {
    if (!phone) return '-';
    return `+91 ${phone}`;
  };
  
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Customer name</th>
              <th>Phone Number</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Product Category</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Customer region</th>
              <th>Product ID</th>
              <th>Employee name</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={sale.transaction_id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{sale.transaction_id || '-'}</td>
                <td>{formatDate(sale.date)}</td>
                <td>{sale.customer_id || '-'}</td>
                <td>{sale.customer_name || '-'}</td>
                <td className="phone-cell">
                  {sale.phone_number ? (
                    <>
                      <span className="phone-icon">📞</span>
                      {formatPhone(sale.phone_number)}
                    </>
                  ) : '-'}
                </td>
                <td>{sale.gender || '-'}</td>
                <td>{sale.age || '-'}</td>
                <td>{sale.product_category || '-'}</td>
                <td>{sale.quantity ? String(sale.quantity).padStart(2, '0') : '00'}</td>
                <td className="amount-cell">{formatCurrency(sale.total_amount)}</td>
                <td>{sale.customer_region || '-'}</td>
                <td>{sale.product_id || '-'}</td>
                <td>{sale.employee_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;
