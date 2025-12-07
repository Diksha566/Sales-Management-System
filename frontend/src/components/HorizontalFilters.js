import React, { useState, useEffect, useRef } from 'react';
import './HorizontalFilters.css';

function HorizontalFilters({ filters, filterOptions, onChange }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const filterRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);
  
  const handleMultiSelectToggle = (filterName, value) => {
    const currentValues = filters[filterName] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      // Remove if already selected
      newValues = currentValues.filter(v => v !== value);
    } else {
      // Add if not selected
      newValues = [...currentValues, value];
    }
    
    onChange(filterName, newValues);
  };
  
  const handleSelectAll = (filterName, options) => {
    const currentValues = filters[filterName] || [];
    if (currentValues.length === options.length) {
      // Deselect all
      onChange(filterName, []);
    } else {
      // Select all
      onChange(filterName, [...options]);
    }
  };
  
  const handleClearFilter = (filterName) => {
    onChange(filterName, []);
  };
  
  const handleRangeChange = (filterName, value) => {
    onChange(filterName, value);
  };
  
  const getSelectedText = (filterName, options) => {
    const selected = filters[filterName] || [];
    if (selected.length === 0) return 'All';
    if (selected.length === 1) return selected[0];
    if (selected.length === options.length) return 'All Selected';
    return `${selected.length} selected`;
  };
  
  const isSelected = (filterName, value) => {
    return (filters[filterName] || []).includes(value);
  };
  
  const renderMultiSelectDropdown = (filterName, label, options, maxHeight = '200px') => {
    const isOpen = openDropdown === filterName;
    const selected = filters[filterName] || [];
    const allSelected = selected.length === options.length && options.length > 0;
    
    return (
      <div className="filter-item multi-select-wrapper">
        <label>{label}</label>
        <div className="multi-select-container">
          <button
            type="button"
            className="multi-select-button"
            onClick={() => setOpenDropdown(isOpen ? null : filterName)}
          >
            <span>{getSelectedText(filterName, options)}</span>
            <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
          </button>
          
          {isOpen && (
            <div className="multi-select-dropdown" style={{ maxHeight }}>
              <div className="dropdown-header">
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => handleSelectAll(filterName, options)}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
                {selected.length > 0 && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => handleClearFilter(filterName)}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="dropdown-options">
                {options.map(option => (
                  <label key={option} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={isSelected(filterName, option)}
                      onChange={() => handleMultiSelectToggle(filterName, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="horizontal-filters" ref={filterRef}>
      {renderMultiSelectDropdown('regions', 'Customer Region', filterOptions.regions || [])}
      {renderMultiSelectDropdown('genders', 'Gender', filterOptions.genders || [])}
      
      <div className="filter-item">
        <label>Age Range</label>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.ageMin}
            onChange={(e) => handleRangeChange('ageMin', e.target.value)}
            className="range-input"
            min={filterOptions.minAge || 0}
            max={filterOptions.maxAge || 150}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.ageMax}
            onChange={(e) => handleRangeChange('ageMax', e.target.value)}
            className="range-input"
            min={filterOptions.minAge || 0}
            max={filterOptions.maxAge || 150}
          />
        </div>
      </div>
      
      {renderMultiSelectDropdown('categories', 'Product Category', filterOptions.categories || [])}
      {renderMultiSelectDropdown('tags', 'Tags', (filterOptions.tags || []).slice(0, 30), '150px')}
      {renderMultiSelectDropdown('paymentMethods', 'Payment Method', filterOptions.paymentMethods || [])}
      
      <div className="filter-item">
        <label>Date</label>
        <div className="date-inputs">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleRangeChange('dateFrom', e.target.value)}
            className="date-input"
            min={filterOptions.minDate}
            max={filterOptions.maxDate || filters.dateTo}
          />
          <span>-</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleRangeChange('dateTo', e.target.value)}
            className="date-input"
            min={filterOptions.minDate || filters.dateFrom}
            max={filterOptions.maxDate}
          />
        </div>
      </div>
    </div>
  );
}

export default HorizontalFilters;
