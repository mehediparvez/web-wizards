import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(url = 'http://localhost:5000') {
    if (this.socket) {
      this.disconnect();
    }

    console.log('Connecting to chatbot socket server:', url);
    
    this.socket = io(url, {
      autoConnect: false,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      upgrade: true,
      rememberUpgrade: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to chatbot socket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chatbot socket server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Chatbot socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to chatbot socket server after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to chatbot socket server');
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send message to chatbot
  sendMessage(message, userId = null) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('send_message', {
      message,
      user_id: userId,
      timestamp: Date.now()
    });
    return true;
  }

  // Listen for messages from chatbot
  onMessage(callback) {
    if (!this.socket) return;
    
    this.socket.on('message', callback);
    this.listeners.set('message', callback);
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;
    
    this.socket.on('typing', callback);
    this.listeners.set('typing', callback);
  }

  // Listen for errors
  onError(callback) {
    if (!this.socket) return;
    
    this.socket.on('error', callback);
    this.listeners.set('error', callback);
  }

  // Listen for symptoms list
  onSymptomsList(callback) {
    if (!this.socket) return;
    
    this.socket.on('symptoms_list', callback);
    this.listeners.set('symptoms_list', callback);
  }

  // Request symptoms list
  getSymptoms() {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('get_symptoms');
    return true;
  }

  // Remove all listeners
  removeListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
  }

  // Check connection status
  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;
