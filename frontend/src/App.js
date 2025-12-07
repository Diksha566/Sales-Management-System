import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import HorizontalFilters from './components/HorizontalFilters';
import SummaryStatistics from './components/SummaryStatistics';
import TransactionTable from './components/TransactionTable';
import SortingDropdown from './components/SortingDropdown';
import PaginationControls from './components/PaginationControls';
import { getSales, getFilterOptions, getSummary } from './services/api';

function App() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalRecords: 0
  });
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [search, setSearch] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    regions: [],
    genders: [],
    ageMin: '',
    ageMax: '',
    categories: [],
    tags: [],
    paymentMethods: [],
    dateFrom: '',
    dateTo: ''
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  
  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  // Load sales data and summary when filters/search/sort/page changes
  useEffect(() => {
    loadSales();
    loadSummary();
  }, [search, filters, sortBy, sortOrder, pagination.page]);
  
  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Error loading filter options:', err);
      setError('Failed to load filter options');
    }
  };
  
  const loadSummary = async () => {
    try {
      // Build query params for summary (same as sales)
      const params = {
        search
      };
      
      if (filters.regions.length > 0) {
        params.regions = filters.regions.join(',');
      }
      if (filters.genders.length > 0) {
        params.genders = filters.genders.join(',');
      }
      if (filters.ageMin) {
        params.ageMin = filters.ageMin;
      }
      if (filters.ageMax) {
        params.ageMax = filters.ageMax;
      }
      if (filters.categories.length > 0) {
        params.categories = filters.categories.join(',');
      }
      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }
      if (filters.paymentMethods.length > 0) {
        params.paymentMethods = filters.paymentMethods.join(',');
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
      
      const summaryData = await getSummary(params);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };
  
  const loadSales = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = {
        search,
        sortBy,
        sortOrder,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
      
      // Add filters
      if (filters.regions.length > 0) {
        params.regions = filters.regions.join(',');
      }
      if (filters.genders.length > 0) {
        params.genders = filters.genders.join(',');
      }
      if (filters.ageMin) {
        params.ageMin = filters.ageMin;
      }
      if (filters.ageMax) {
        params.ageMax = filters.ageMax;
      }
      if (filters.categories.length > 0) {
        params.categories = filters.categories.join(',');
      }
      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }
      if (filters.paymentMethods.length > 0) {
        params.paymentMethods = filters.paymentMethods.join(',');
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
      
      const response = await getSales(params);
      setSales(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (err) {
      console.error('Error loading sales:', err);
      setError('Failed to load sales data');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Sales Management System</h1>
        <SearchBar 
          value={search}
          onChange={handleSearchChange}
        />
      </header>
      
      <main className="app-main">
        <SummaryStatistics summary={summary} />
        
        <div className="filters-sort-row">
          <HorizontalFilters
            filters={filters}
            filterOptions={filterOptions}
            onChange={handleFilterChange}
          />
          <SortingDropdown
            sortBy={sortBy}
            sortOrder={sortOrder}
            onChange={handleSortChange}
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <TransactionTable
          sales={sales}
          loading={loading}
        />
        
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}

export default App;
