#!/bin/bash

echo "🎵 Setting up Mixtape AI React App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Node.js and Python 3 are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create backend directory if it doesn't exist
if [ ! -d "backend" ]; then
    echo "📁 Creating backend directory..."
    mkdir backend
fi

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Set up your environment variables in backend/.env"
echo "2. Run: npm run dev"
echo ""
echo "This will start both the React frontend (port 3000) and Flask backend (port 5000)"
echo ""
echo "Happy coding! 🎵" 