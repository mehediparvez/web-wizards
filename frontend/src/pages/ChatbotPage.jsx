import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/authContextDefinition';
import MainLayout from '../layouts/MainLayout';
import ChatbotContent from '../components/Chat/ChatbotContent';
import ChatbotInput from '../components/Chat/ChatbotInput';
import chatbotService from '../services/chatbotService';
import socketService from '../services/socketService';
import { toast } from 'react-hot-toast';
import { 
  CpuChipIcon, 
  WifiIcon, 
  ExclamationTriangleIcon,
  SignalSlashIcon 
} from '@heroicons/react/24/outline';

const ChatbotPage = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [useWebSocket, setUseWebSocket] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    if (useWebSocket) {
      const chatbotUrl = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000';
      
      try {
        socketService.connect(chatbotUrl);
        setConnectionStatus('connecting');

        // Set up event listeners
        socketService.onMessage((messageData) => {
          console.log('Received message:', messageData);
          setIsTyping(false);
          
          const newMessage = {
            id: messageData.id || Date.now(),
            text: messageData.text,
            sender: 'bot',
            timestamp: messageData.timestamp || Date.now(),
            type: messageData.type || 'default',
            data: messageData.data
          };
          
          setMessages(prev => [...prev, newMessage]);
          setError(null);
        });

        socketService.onTyping((typingData) => {
          setIsTyping(typingData.typing);
        });

        socketService.onError((errorData) => {
          console.error('Socket error:', errorData);
          setError(errorData.error || 'Connection error occurred');
          setIsTyping(false);
        });

        // Check connection status
        const checkConnection = () => {
          const connected = socketService.isSocketConnected();
          setIsConnected(connected);
          setConnectionStatus(connected ? 'connected' : 'disconnected');
        };

        const intervalId = setInterval(checkConnection, 2000);
        
        return () => {
          clearInterval(intervalId);
          socketService.removeListeners();
          socketService.disconnect();
        };
      } catch (error) {
        console.error('Failed to connect to chatbot:', error);
        setError('Failed to connect to chatbot service');
        setConnectionStatus('error');
      }
    }
  }, [useWebSocket]);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await chatbotService.healthCheck();
        console.log('Chatbot service is healthy');
      } catch (error) {
        console.error('Chatbot service health check failed:', error);
        toast.error('Chatbot service is not available');
      }
    };

    checkHealth();
  }, []);

  const handleSendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: Date.now(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);

    try {
      if (useWebSocket && isConnected) {
        // Use WebSocket
        const sent = socketService.sendMessage(message, user?.id);
        if (sent) {
          setIsTyping(true);
        } else {
          throw new Error('Failed to send message via WebSocket');
        }
      } else {
        // Use REST API
        setIsTyping(true);
        const response = await chatbotService.chat(message);
        setIsTyping(false);

        if (response.success) {
          const botMessage = {
            id: Date.now() + 1,
            text: response.response,
            sender: 'bot',
            timestamp: Date.now(),
            type: response.type || 'default',
            data: response.data
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error(response.error || 'Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setError(error.message || 'Failed to send message');
      toast.error('Failed to send message');
    }
  }, [useWebSocket, isConnected, user?.id]);

  const handleSymptomsAnalysis = useCallback(async (symptoms) => {
    if (!symptoms || symptoms.length === 0) return;

    const symptomsMessage = {
      id: Date.now(),
      text: `Analyzing symptoms: ${symptoms.join(', ')}`,
      sender: 'user',
      timestamp: Date.now(),
      type: 'symptoms'
    };

    setMessages(prev => [...prev, symptomsMessage]);
    setError(null);

    try {
      setIsTyping(true);
      const response = await chatbotService.predictDisease(symptoms);
      setIsTyping(false);

      if (response.success) {
        const prediction = response.prediction;
        let botText = `**Possible Condition:** ${prediction.disease}\n\n`;
        botText += `**Description:** ${prediction.description}\n\n`;
        
        if (prediction.precautions && prediction.precautions.length > 0) {
          botText += `**Precautions:**\n`;
          prediction.precautions.slice(0, 3).forEach((precaution, index) => {
            botText += `${index + 1}. ${precaution}\n`;
          });
          botText += '\n';
        }

        if (prediction.medications && prediction.medications.length > 0) {
          botText += `**Medications:** ${prediction.medications.join(', ')}\n\n`;
        }

        botText += `*Please consult with a healthcare professional for proper diagnosis and treatment.*`;

        const botMessage = {
          id: Date.now() + 1,
          text: botText,
          sender: 'bot',
          timestamp: Date.now(),
          type: 'diagnosis',
          data: {
            disease: prediction.disease,
            symptoms_found: response.input_analysis?.valid_symptoms || symptoms
          }
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error || 'Failed to analyze symptoms');
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setIsTyping(false);
      setError(error.message || 'Failed to analyze symptoms');
      toast.error('Failed to analyze symptoms');
    }
  }, []);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <SignalSlashIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <CpuChipIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical AI Assistant</h1>
                <p className="text-sm text-gray-600">Get instant medical guidance based on your symptoms</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                {getConnectionIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getConnectionText()}
                </span>
              </div>
              
              {/* Toggle WebSocket/REST */}
              <button
                onClick={() => setUseWebSocket(!useWebSocket)}
                className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-50"
                title={`Switch to ${useWebSocket ? 'REST API' : 'WebSocket'}`}
              >
                {useWebSocket ? 'WS' : 'REST'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <ChatbotContent 
            messages={messages} 
            isTyping={isTyping}
            error={error}
          />
          
          <ChatbotInput
            onSendMessage={handleSendMessage}
            onSymptomsAnalysis={handleSymptomsAnalysis}
            disabled={isTyping}
            isTyping={isTyping}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This AI assistant provides general health information and should not replace professional medical advice. 
            Always consult with qualified healthcare providers for diagnosis and treatment.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatbotPage;
