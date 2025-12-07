import React from 'react';
import './PaginationControls.css';

function PaginationControls({ pagination, onPageChange }) {
  const { page, totalPages } = pagination;
  
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
  
  return (
    <div className="pagination-controls">
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
    </div>
  );
}

export default PaginationControls;
