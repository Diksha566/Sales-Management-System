# Sales Management System

## Overview

The Sales Management System is a full-stack web application designed to manage and analyze retail sales data. It provides a comprehensive interface for searching, filtering, sorting, and paginating through large datasets of sales transactions. The system features a React-based frontend with a RESTful Express.js backend, utilizing SQLite for efficient data storage and retrieval.

## Tech Stack

**Frontend:**
- React 18.2.0
- Axios 1.6.0
- React Scripts 5.0.1

**Backend:**
- Node.js
- Express.js 4.18.2
- SQLite3 5.1.6
- CORS 2.8.5
- CSV Parser 3.0.0

**Database:**
- SQLite

## Search Implementation Summary

The search functionality allows users to search for sales records by customer name or phone number. The implementation uses SQL LIKE queries with wildcard matching (`%searchTerm%`) to find partial matches in both fields. The search is case-insensitive and triggers automatically as the user types, resetting pagination to page 1 when a new search is performed. The search query is combined with active filters and sorting parameters to provide comprehensive results.

## Filter Implementation Summary

The filtering system supports multiple filter types: multi-select filters for regions, genders, product categories, tags, and payment methods; numeric range filters for age (min/max); and date range filters for transaction dates. Filters are applied using SQL WHERE clauses with IN operators for multi-select filters and comparison operators for ranges. The backend validates filter inputs (e.g., ensuring min age ≤ max age, start date ≤ end date) and returns appropriate error messages for invalid ranges. All filters can be combined, and the filter panel provides a "Clear All" option to reset all active filters at once.

## Sorting Implementation Summary

Sorting is implemented with three sortable fields: date (default, newest first), quantity, and customer name. The sorting uses SQL ORDER BY clauses with ASC or DESC order. For date sorting, the default order is DESC (newest first) and cannot be changed. For quantity and customer name, users can toggle between ascending and descending order via a dropdown. When sorting changes, pagination resets to page 1 to show sorted results from the beginning.

## Pagination Implementation Summary

Pagination is implemented using SQL LIMIT and OFFSET clauses to fetch data in chunks. The default page size is 10 records per page, with a maximum of 100 records per page enforced by the backend. The pagination controls display up to 6 page numbers at a time, showing pages 1-6 when near the start, the last 6 pages when near the end, or pages around the current page in the middle. The pagination state includes current page, page size, total records, and total pages, which are calculated server-side based on the filtered dataset.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Import the CSV data into SQLite database:
   ```bash
   node src/services/database/import.js
   ```
   **Note:** This may take several minutes depending on dataset size.

4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will automatically open in your browser at `http://localhost:3000`

### Troubleshooting

- **Backend won't start:** Ensure port 5000 is available and the database import completed successfully
- **Frontend won't connect:** Verify the backend is running on port 5000
- **No data showing:** Check that the database import completed and filters aren't too restrictive

