#!/bin/bash

# Azure Container Instance startup script for Medical Chatbot

# Check if model exists, if not try to retrain
if [ ! -f "svc.pkl" ]; then
    echo "Model file not found, attempting to retrain..."
    python retrain_model.py || echo "Model retraining failed, app will use fallback"
fi

# Start the application
echo "Starting Medical Chatbot Service..."
python app.py
