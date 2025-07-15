#!/bin/bash

# Chatbot Model Fix Script
# This script fixes the numpy compatibility issue with the chatbot service

echo "🔧 Chatbot Model Fix Script"
echo "=============================="

# Stop the chatbot service if it's running
echo "📋 Stopping chatbot service..."
docker-compose stop chatbot 2>/dev/null || echo "Service not running"

# Method 1: Rebuild the chatbot container
echo "🔨 Rebuilding chatbot container..."
docker-compose build --no-cache chatbot

# Method 2: If rebuild doesn't work, try manual fix
echo "🔍 Checking if manual fix is needed..."
if ! docker-compose exec chatbot python -c "import pickle; pickle.load(open('svc.pkl', 'rb'))" 2>/dev/null; then
    echo "⚠️  Manual fix required"
    
    # Enter the container and fix the model
    echo "🚀 Entering container to retrain model..."
    docker-compose run --rm chatbot python retrain_model.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Model retrained successfully"
    else
        echo "❌ Model retraining failed"
        echo "📝 The service will run with fallback prediction method"
    fi
fi

# Start the service
echo "🚀 Starting chatbot service..."
docker-compose up -d chatbot

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Test the service
echo "🧪 Testing chatbot service..."
if curl -s -f "http://localhost:5000/health" > /dev/null; then
    echo "✅ Chatbot service is healthy and ready!"
    echo "🌐 Access the chatbot at: http://localhost:5173/chatbot"
else
    echo "❌ Chatbot service health check failed"
    echo "📋 Check logs with: docker-compose logs chatbot"
fi

echo ""
echo "📚 Troubleshooting:"
echo "  - Check logs: docker-compose logs chatbot"
echo "  - Restart service: docker-compose restart chatbot"
echo "  - Manual retrain: docker-compose exec chatbot python retrain_model.py"
echo "  - Clean rebuild: docker-compose down && docker-compose build --no-cache chatbot && docker-compose up -d"
