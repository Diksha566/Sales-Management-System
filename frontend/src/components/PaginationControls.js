import React from 'react';
import './PaginationControls.css';

function PaginationControls({ pagination, onPageChange, onPageSizeChange }) {
  const { page, totalPages, pageSize, total } = pagination;
  
  if (totalPages <= 1) {
    return null;
  }
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 6; // Show up to 6 pages as in design
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 6; i++) {
          pages.push(i);
        }
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 5; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = page - 2; i <= page + 3; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };
  
  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    const newPageSize = value === 'all' ? total : parseInt(value);
    onPageSizeChange(newPageSize);
  };
  
  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        <span className="records-info">
          Showing {startRecord}-{endRecord} of {total} records
        </span>
        <div className="page-size-selector">
          <label htmlFor="pageSize">Show:</label>
          <select 
            id="pageSize" 
            value={pageSize >= total ? 'all' : pageSize} 
            onChange={handlePageSizeChange}
            className="page-size-select"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="page-numbers">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`pagination-btn page-number ${pageNum === page ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaginationControls;
