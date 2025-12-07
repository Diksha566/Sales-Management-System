# Architecture Document

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3
- **Data Import:** csv-parser

### Structure
```
backend/
├── server.js              # Main server entry point
├── database/
│   ├── db.js             # Database initialization and connection
│   └── import.js         # CSV data import script
├── controllers/
│   └── salesController.js # Business logic for sales operations
└── routes/
    └── sales.js          # API route definitions
```

### Key Components

#### Database Layer (`database/db.js`)
- Handles SQLite database connection
- Creates sales table schema with all required fields
- Provides database instance management

#### Import Script (`database/import.js`)
- Reads CSV file in streaming fashion for memory efficiency
- Batches inserts (1000 records per batch) for performance
- Handles large datasets without memory issues

#### API Controller (`controllers/salesController.js`)
- `getSales()`: Main endpoint handling search, filters, sorting, and pagination
  - Builds dynamic SQL WHERE clauses based on query parameters
  - Validates and sanitizes inputs
  - Implements pagination with LIMIT/OFFSET
  - Returns data with pagination metadata
  
- `getFilterOptions()`: Provides available filter values
  - Queries distinct values for each filter type
  - Calculates min/max for range filters (age, date)
  - Flattens comma-separated tags into unique list

#### Routes (`routes/sales.js`)
- `/api/sales` - GET endpoint for sales data
- `/api/sales/filters` - GET endpoint for filter options

### Data Flow

1. **Data Import Flow:**
   ```
   CSV File → csv-parser → Batch Processing → SQLite INSERT → Database
   ```

2. **API Request Flow:**
   ```
   Client Request → Express Router → Controller → Database Query → Response
   ```

3. **Query Building:**
   - Extracts query parameters (search, filters, sort, pagination)
   - Builds WHERE clause conditions dynamically
   - Applies sorting and pagination
   - Executes parameterized SQL query
   - Returns JSON response with data and metadata

## Frontend Architecture

### Technology Stack
- **Framework:** React 18.2.0
- **HTTP Client:** Axios
- **Styling:** CSS3 with component-scoped styles

### Structure
```
frontend/
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── App.js            # Main application component
│   ├── App.css           # Main app styles
│   ├── index.js          # React entry point
│   ├── index.css         # Global styles
│   ├── components/
│   │   ├── SearchBar.js
│   │   ├── FilterPanel.js
│   │   ├── TransactionTable.js
│   │   ├── SortingDropdown.js
│   │   └── PaginationControls.js
│   └── services/
│       └── api.js         # API communication layer
```

### Component Hierarchy
```
App
├── SearchBar
├── SortingDropdown
├── FilterPanel
│   ├── Multi-select filters (Region, Gender, Category, etc.)
│   ├── Range inputs (Age, Date)
│   └── Clear filters button
├── TransactionTable
└── PaginationControls
```

### State Management

**App Component State:**
- `search`: Search query string
- `filters`: Object containing all filter values
- `sortBy`: Current sort field
- `sortOrder`: Sort direction (ASC/DESC)
- `pagination`: Pagination state (page, total, etc.)
- `sales`: Array of sales records
- `filterOptions`: Available filter values
- `loading`: Loading state
- `error`: Error state

**State Flow:**
1. User interaction (search, filter, sort, pagination)
2. State update in App component
3. useEffect triggers API call
4. API response updates sales data and pagination
5. Components re-render with new data

### Data Flow

1. **Initial Load:**
   ```
   App Mount → Load Filter Options → Load Sales Data → Render Components
   ```

2. **User Interaction:**
   ```
   User Action → State Update → useEffect → API Call → Update State → Re-render
   ```

3. **API Communication:**
   - Axios instance configured with base URL
   - Query parameters built from current state
   - Response parsed and state updated
   - Error handling for failed requests

## Folder Structure

```
newproject/
├── backend/
│   ├── database/
│   │   ├── db.js
│   │   ├── import.js
│   │   └── sales.db (generated)
│   ├── controllers/
│   │   └── salesController.js
│   ├── routes/
│   │   └── sales.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docs/
│   └── architecture.md
├── truestate_assignment_dataset.csv
├── .gitignore
└── README.md
```

## Module Responsibilities

### Backend Modules

**server.js**
- Express app initialization
- Middleware configuration (CORS, JSON parsing)
- Route mounting
- Server startup

**database/db.js**
- Database connection management
- Table schema creation
- Database instance provision

**database/import.js**
- CSV file reading
- Data transformation
- Batch database insertion
- Import progress tracking

**controllers/salesController.js**
- Request parameter extraction
- SQL query construction
- Filter logic implementation
- Search logic implementation
- Sort logic implementation
- Pagination calculation
- Response formatting

**routes/sales.js**
- Route definition
- Controller method mapping

### Frontend Modules

**App.js**
- Main application state management
- Component orchestration
- API call coordination
- User interaction handlers

**components/SearchBar.js**
- Search input rendering
- Search value change handling

**components/FilterPanel.js**
- Filter UI rendering
- Multi-select filter management
- Range input handling
- Filter state updates

**components/TransactionTable.js**
- Sales data display
- Table formatting
- Loading/empty states
- Data formatting (currency, dates)

**components/SortingDropdown.js**
- Sort field selection
- Sort order selection
- Sort state management

**components/PaginationControls.js**
- Page navigation
- Page number display
- Pagination state display

**services/api.js**
- HTTP client configuration
- API endpoint definitions
- Request/response handling

## Security Considerations

- SQL injection prevention through parameterized queries
- Input validation on backend
- CORS configuration for API access
- No sensitive data exposure in frontend

## Performance Optimizations

- Database indexing on frequently queried fields (would be added in production)
- Batch CSV import for large datasets
- Pagination to limit data transfer
- Efficient SQL queries with proper WHERE clauses
- React component memoization potential (for future optimization)


