#!/bin/bash

echo "=========================================="
echo "EV Test Drive Service - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"
echo ""

# Backend setup
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="
cd backend
echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# Frontend setup
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="
cd frontend
echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. In one terminal, start the backend:"
echo "   cd backend && npm start"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
