import React, { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({ filters, filterOptions, onChange, onClear }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleMultiSelectChange = (filterName, value, checked) => {
    const currentValues = filters[filterName] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onChange(filterName, newValues);
  };
  
  const hasActiveFilters = () => {
    return (
      filters.regions.length > 0 ||
      filters.genders.length > 0 ||
      filters.ageMin ||
      filters.ageMax ||
      filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.paymentMethods.length > 0 ||
      filters.dateFrom ||
      filters.dateTo
    );
  };
  
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-header-actions">
          {hasActiveFilters() && (
            <button onClick={onClear} className="clear-filters-btn">
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-filters-btn"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="filter-content">
          <div className="filter-row">
            {/* Region Filter */}
            <div className="filter-group">
              <label className="filter-label">Customer Region</label>
              <div className="checkbox-group">
                {filterOptions.regions?.map(region => (
                  <label key={region} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(region)}
                      onChange={(e) => handleMultiSelectChange('regions', region, e.target.checked)}
                    />
                    <span>{region}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Gender Filter */}
            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <div className="checkbox-group">
                {filterOptions.genders?.map(gender => (
                  <label key={gender} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.genders.includes(gender)}
                      onChange={(e) => handleMultiSelectChange('genders', gender, e.target.checked)}
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Age Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Age Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder={filterOptions.minAge ? `Min (${filterOptions.minAge})` : 'Min'}
                  value={filters.ageMin}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
                      onChange('ageMin', value);
                    }
                  }}
                  min={filterOptions.minAge || 0}
                  max={filterOptions.maxAge || 150}
                  className="range-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder={filterOptions.maxAge ? `Max (${filterOptions.maxAge})` : 'Max'}
                  value={filters.ageMax}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
                      onChange('ageMax', value);
                    }
                  }}
                  min={filterOptions.minAge || 0}
                  max={filterOptions.maxAge || 150}
                  className="range-input"
                />
              </div>
              {filters.ageMin && filters.ageMax && parseInt(filters.ageMin) > parseInt(filters.ageMax) && (
                <div className="filter-error">Minimum age cannot be greater than maximum age</div>
              )}
            </div>
          </div>
          
          <div className="filter-row">
            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Product Category</label>
              <div className="checkbox-group">
                {filterOptions.categories?.map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => handleMultiSelectChange('categories', category, e.target.checked)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Tags Filter */}
            <div className="filter-group">
              <label className="filter-label">Tags</label>
              <div className="checkbox-group tags-group">
                {filterOptions.tags?.slice(0, 20).map(tag => (
                  <label key={tag} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={(e) => handleMultiSelectChange('tags', tag, e.target.checked)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Payment Method Filter */}
            <div className="filter-group">
              <label className="filter-label">Payment Method</label>
              <div className="checkbox-group">
                {filterOptions.paymentMethods?.map(method => (
                  <label key={method} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.paymentMethods.includes(method)}
                      onChange={(e) => handleMultiSelectChange('paymentMethods', method, e.target.checked)}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="filter-row">
            {/* Date Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange('dateFrom', e.target.value)}
                  min={filterOptions.minDate}
                  max={filterOptions.maxDate || filters.dateTo}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange('dateTo', e.target.value)}
                  min={filterOptions.minDate || filters.dateFrom}
                  max={filterOptions.maxDate}
                  className="date-input"
                />
              </div>
              {filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo) && (
                <div className="filter-error">Start date cannot be after end date</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;

