#!/bin/bash

echo "Setting up Retail Sales Management System Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize database
echo ""
echo "Initializing database..."
node src/services/database/import.js

echo ""
echo "Setup complete!"
echo "You can now start the server with: npm start"


