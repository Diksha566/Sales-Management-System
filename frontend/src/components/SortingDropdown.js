import React from 'react';
import './SortingDropdown.css';

function SortingDropdown({ sortBy, sortOrder, onChange }) {
  const handleFieldChange = (e) => {
    const field = e.target.value;
    // Default sort order based on field
    const defaultOrder = field === 'date' ? 'DESC' : 'ASC';
    onChange(field, defaultOrder);
  };
  
  const handleOrderChange = (e) => {
    onChange(sortBy, e.target.value);
  };
  
  const getSortLabel = () => {
    if (sortBy === 'date') return 'Date (Newest First)';
    if (sortBy === 'quantity') return 'Quantity';
    if (sortBy === 'customer_name') return sortOrder === 'ASC' ? 'Customer Name (A-Z)' : 'Customer Name (Z-A)';
    return 'Sort by';
  };
  
  return (
    <div className="sorting-dropdown">
      <label htmlFor="sort-field" className="sort-label">Sort by:</label>
      <select
        id="sort-field"
        value={sortBy}
        onChange={handleFieldChange}
        className="sort-select"
      >
        <option value="date">Date (Newest First)</option>
        <option value="quantity">Quantity</option>
        <option value="customer_name">Customer Name (A-Z)</option>
      </select>
      
      {sortBy !== 'date' && (
        <select
          id="sort-order"
          value={sortOrder}
          onChange={handleOrderChange}
          className="sort-select"
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      )}
    </div>
  );
}

export default SortingDropdown;
