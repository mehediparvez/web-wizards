import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  ChatBubbleLeftEllipsisIcon, 
  UserIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ChatbotMessage = ({ message, isTyping = false }) => {
  const { sender, text, timestamp, type, data } = message;
  const isBot = sender === 'bot';
  
  const getMessageTypeIcon = () => {
    switch (type) {
      case 'diagnosis':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'greeting':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'help':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const renderDiagnosisData = () => {
    if (type !== 'diagnosis' || !data) return null;

    return (
      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-800">
            Possible Condition: {data.disease}
          </span>
        </div>
        {data.symptoms_found && data.symptoms_found.length > 0 && (
          <div className="text-xs text-orange-600">
            Based on symptoms: {data.symptoms_found.join(', ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isBot
              ? 'bg-gray-100 text-gray-800'
              : 'bg-teal-500 text-white'
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">AI is typing...</span>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                {getMessageTypeIcon()}
                <div 
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: formatMessageText(text) }}
                />
              </div>
              {renderDiagnosisData()}
            </>
          )}
        </div>
        
        {!isTyping && timestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {format(new Date(timestamp), 'HH:mm')}
          </div>
        )}
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

const ChatbotContent = ({ messages, isTyping, error }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <ChatBubbleLeftEllipsisIcon className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">Welcome to Medical AI Assistant</h3>
          <p className="text-center max-w-md">
            I can help you identify possible medical conditions based on your symptoms. 
            Just describe how you're feeling and I'll provide information and guidance.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Example: "I have a headache and fever"</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatbotMessage
              key={message.id}
              message={message}
            />
          ))}
          
          {isTyping && (
            <ChatbotMessage
              message={{
                id: 'typing',
                sender: 'bot',
                text: '',
                timestamp: null
              }}
              isTyping={true}
            />
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

ChatbotMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sender: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    data: PropTypes.object
  }).isRequired,
  isTyping: PropTypes.bool
};

ChatbotContent.propTypes = {
  messages: PropTypes.array.isRequired,
  isTyping: PropTypes.bool,
  error: PropTypes.string
};

export default ChatbotContent;
