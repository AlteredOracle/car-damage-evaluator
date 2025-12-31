#!/bin/bash

# Function to kill process on a specific port
kill_port() {
    PORT=$1
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
        echo "Killing process on port $PORT (PID: $PID)..."
        kill -9 $PID
    else
        echo "Port $PORT is free."
    fi
}

echo "🚗 Starting Car Damage Evaluator..."

# 1. Kill existing processes
echo "Cleaning up ports..."
kill_port 8000
kill_port 3000

# 2. Start Backend
echo "Starting Backend..."
source venv/bin/activate
# Run uvicorn in background, save PID
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# 3. Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Function to handle script exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C) to run cleanup
trap cleanup SIGINT

# Wait for both processes
wait
