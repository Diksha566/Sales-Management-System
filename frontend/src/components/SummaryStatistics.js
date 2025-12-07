import React from 'react';
import './SummaryStatistics.css';

function SummaryStatistics({ summary }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };
  
  return (
    <div className="summary-statistics">
      <div className="stat-card">
        <div className="stat-label">Total units sold</div>
        <div className="stat-value">{formatNumber(summary.totalUnits)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Amount</div>
        <div className="stat-value">{formatCurrency(summary.totalAmount)}</div>
        <div className="stat-subtext">({summary.totalRecords} SRs)</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Discount</div>
        <div className="stat-value">{formatCurrency(summary.totalDiscount)}</div>
        <div className="stat-subtext">({summary.totalRecords} SRs)</div>
      </div>
    </div>
  );
}

export default SummaryStatistics;

