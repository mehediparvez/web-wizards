# Chatbot Integration Setup Instructions

## Overview
The chatbot service has been integrated into the AmarHealth platform to provide AI-powered medical assistance. This document outlines the setup and testing procedures.

## Services Added

### 1. Chatbot Service (Flask + SocketIO)
- **Location**: `./chatbot/`
- **Port**: 5000
- **Features**:
  - REST API endpoints for symptom analysis
  - WebSocket support for real-time chat
  - Machine learning-based disease prediction
  - Symptom suggestion and validation

### 2. Frontend Integration
- **New Components**:
  - `ChatbotPage.jsx` - Main chatbot interface
  - `ChatbotContent.jsx` - Message display component
  - `ChatbotInput.jsx` - Enhanced input with symptom selector
  - `SymptomsSelector.jsx` - Interactive symptom selection

- **Services**:
  - `chatbotService.js` - REST API client
  - `socketService.js` - WebSocket client

## Quick Start

### 1. Install Dependencies
```bash
# Install socket.io-client for frontend
cd frontend
npm install

# Install Python packages for chatbot
cd ../chatbot
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file in root directory:
```bash
# Copy from example
cp .env.example .env

# Edit the .env file with your configurations
```

### 3. Start Services
```bash
# Start all services with Docker Compose
docker-compose up

# Or start individual services for development:
# Backend
cd backend && python manage.py runserver

# Frontend
cd frontend && npm run dev

# Chatbot
cd chatbot && python app.py
```

## Testing the Integration

### 1. Access the Chatbot
1. Open http://localhost:5173
2. Login to your account
3. Navigate to "AI Assistant" in the sidebar
4. The chatbot interface should load

### 2. Test Features

#### Basic Chat
- Type: "Hello" or "Hi"
- Expected: Welcome message with usage instructions

#### Symptom Analysis
- Type: "I have a headache and fever"
- Expected: Disease prediction with recommendations

#### Structured Symptom Selection
- Click the beaker icon (🧪) in the input area
- Select symptoms from the dropdown
- Click "Analyze Symptoms"
- Expected: Detailed analysis with precautions

#### Quick Actions
- Use the suggested symptom buttons
- Expected: Auto-filled input with common symptoms

### 3. WebSocket Testing
- Open browser developer tools (F12)
- Go to Network tab
- Look for WebSocket connections to localhost:5000
- Send messages and verify real-time responses

## API Endpoints

### Chatbot Service (Port 5000)
- `GET /health` - Health check
- `GET /api/symptoms` - List available symptoms
- `POST /api/predict` - Predict disease from symptoms
- `POST /api/chat` - Chat with AI assistant
- `WebSocket /socket.io/` - Real-time chat

### Frontend Environment Variables
```bash
VITE_API_URL=http://localhost:8000          # Backend API
VITE_CHATBOT_API_URL=http://localhost:5000  # Chatbot API
```

## Troubleshooting

### Common Issues

1. **"Chatbot service not available"**
   - Check if chatbot service is running on port 5000
   - Verify CORS settings in chatbot/app.py
   - Check network connectivity

2. **"Failed to connect to socket server"**
   - Ensure SocketIO server is running
   - Check browser console for WebSocket errors
   - Verify socket.io-client is installed

3. **"No module named 'numpy._core'" Error**
   - This is a numpy version compatibility issue
   - **Quick Fix**: Run the provided fix script:
     ```bash
     # On Linux/Mac
     ./fix_chatbot_model.sh
     
     # On Windows
     ./fix_chatbot_model.bat
     ```
   - **Manual Fix**:
     ```bash
     # Stop and rebuild the container
     docker-compose stop chatbot
     docker-compose build --no-cache chatbot
     
     # If still failing, retrain the model
     docker-compose run --rm chatbot python retrain_model.py
     
     # Start the service
     docker-compose up -d chatbot
     ```

4. **"No symptoms found"**
   - Check if ML model files are present in chatbot directory
   - Verify CSV data files are loaded correctly
   - Check Python dependencies

### Debug Steps
1. Check service logs:
   ```bash
   docker-compose logs chatbot
   ```

2. Test API directly:
   ```bash
   curl http://localhost:5000/health
   curl -X POST http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```

3. Check browser console for frontend errors

## Next Steps

### Enhancements to Consider
1. **Conversation History**: Store chat history in database
2. **User Context**: Integrate with user medical records
3. **Advanced ML**: Train custom models on medical data
4. **Multi-language**: Support multiple languages
5. **Voice Input**: Add speech-to-text functionality

### Production Considerations
1. **Security**: Add authentication to chatbot endpoints
2. **Scaling**: Implement load balancing for multiple instances
3. **Monitoring**: Add logging and metrics
4. **Rate Limiting**: Prevent abuse of AI endpoints

## Support
For issues or questions, contact the development team or create an issue in the repository.
