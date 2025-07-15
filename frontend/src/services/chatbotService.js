import axios from 'axios';

// Get chatbot API URL from environment or use default
const CHATBOT_API_URL = (import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000').replace(/\/$/, '');

console.log('Chatbot service using API URL:', CHATBOT_API_URL);

class ChatbotService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: CHATBOT_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for debugging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('Chatbot API Request:', config.method.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('Chatbot API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('Chatbot API Response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('Chatbot API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      throw error;
    }
  }

  // Get available symptoms
  async getSymptoms() {
    try {
      const response = await this.apiClient.get('/api/symptoms');
      return response.data;
    } catch (error) {
      console.error('Failed to get symptoms:', error);
      throw error;
    }
  }

  // Predict disease based on symptoms
  async predictDisease(symptoms) {
    try {
      const response = await this.apiClient.post('/api/predict', {
        symptoms: symptoms
      });
      return response.data;
    } catch (error) {
      console.error('Failed to predict disease:', error);
      throw error;
    }
  }

  // Chat with the bot
  async chat(message) {
    try {
      const response = await this.apiClient.post('/api/chat', {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Failed to chat with bot:', error);
      throw error;
    }
  }

  // Format symptoms for display
  formatSymptoms(symptoms) {
    return symptoms.map(symptom => 
      symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  }

  // Parse symptoms from text
  parseSymptoms(text) {
    const words = text.toLowerCase().split(/[\s,]+/);
    return words.filter(word => word.trim().length > 0);
  }
}

// Create and export singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;
