@echo off
REM Chatbot Model Fix Script for Windows
REM This script fixes the numpy compatibility issue with the chatbot service

echo 🔧 Chatbot Model Fix Script
echo ==============================

REM Stop the chatbot service if it's running
echo 📋 Stopping chatbot service...
docker-compose stop chatbot 2>nul || echo Service not running

REM Method 1: Rebuild the chatbot container
echo 🔨 Rebuilding chatbot container...
docker-compose build --no-cache chatbot

REM Method 2: If rebuild doesn't work, try manual fix
echo 🔍 Checking if manual fix is needed...
docker-compose exec chatbot python -c "import pickle; pickle.load(open('svc.pkl', 'rb'))" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Manual fix required
    
    REM Enter the container and fix the model
    echo 🚀 Entering container to retrain model...
    docker-compose run --rm chatbot python retrain_model.py
    
    if %errorlevel% equ 0 (
        echo ✅ Model retrained successfully
    ) else (
        echo ❌ Model retraining failed
        echo 📝 The service will run with fallback prediction method
    )
)

REM Start the service
echo 🚀 Starting chatbot service...
docker-compose up -d chatbot

REM Wait for service to be ready
echo ⏳ Waiting for service to be ready...
timeout /t 10 /nobreak >nul

REM Test the service
echo 🧪 Testing chatbot service...
curl -s -f "http://localhost:5000/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Chatbot service is healthy and ready!
    echo 🌐 Access the chatbot at: http://localhost:5173/chatbot
) else (
    echo ❌ Chatbot service health check failed
    echo 📋 Check logs with: docker-compose logs chatbot
)

echo.
echo 📚 Troubleshooting:
echo   - Check logs: docker-compose logs chatbot
echo   - Restart service: docker-compose restart chatbot
echo   - Manual retrain: docker-compose exec chatbot python retrain_model.py
echo   - Clean rebuild: docker-compose down ^&^& docker-compose build --no-cache chatbot ^&^& docker-compose up -d

pause
