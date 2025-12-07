# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Step 1: Backend Setup

```bash
cd backend
npm install
node src/services/database/import.js
npm start
```

The backend will run on `http://localhost:5000`

**Note:** The CSV import may take several minutes depending on the dataset size.

## Step 2: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Testing the Application

1. **Search:** Type a customer name or phone number in the search bar
2. **Filters:** Click "Expand" in the filter panel to see all filter options
   - Select multiple regions, genders, categories, etc.
   - Set age range and date range
3. **Sorting:** Use the dropdown to sort by Date, Quantity, or Customer Name
4. **Pagination:** Navigate through pages using Previous/Next or page numbers

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check that the database was imported successfully
- Verify Node.js is installed: `node --version`

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify the API URL in `frontend/src/services/api.js`

### Database import fails
- Check that `truestate_assignment_dataset.csv` exists in the project root
- Ensure you have enough disk space
- Check file permissions

### No data showing
- Verify the database import completed successfully
- Check backend logs for errors
- Ensure filters aren't too restrictive


