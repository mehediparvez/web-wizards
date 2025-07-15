import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  PaperAirplaneIcon, 
  BeakerIcon, 
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import SymptomsSelector from './SymptomsSelector';

const ChatbotInput = ({ 
  onSendMessage, 
  onSymptomsAnalysis, 
  disabled = false, 
  isTyping = false 
}) => {
  const [message, setMessage] = useState('');
  const [showSymptomsSelector, setShowSymptomsSelector] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSymptomsAnalysis = () => {
    if (selectedSymptoms.length > 0) {
      onSymptomsAnalysis(selectedSymptoms);
      setSelectedSymptoms([]);
      setShowSymptomsSelector(false);
    }
  };

  const formatSymptom = (symptom) => {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const quickActions = [
    { text: "I have a headache and fever", icon: "🤒" },
    { text: "I'm feeling nauseous", icon: "🤢" },
    { text: "I have chest pain", icon: "💔" },
    { text: "I can't sleep well", icon: "😴" },
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Symptoms Selector */}
      {showSymptomsSelector && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Symptom Analysis</h3>
            <button
              type="button"
              onClick={() => setShowSymptomsSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <SymptomsSelector
            onSymptomsChange={setSelectedSymptoms}
            initialSymptoms={selectedSymptoms}
          />
          
          {selectedSymptoms.length > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSymptomsAnalysis}
                disabled={disabled}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BeakerIcon className="h-4 w-4" />
                Analyze Symptoms
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!showSymptomsSelector && message === '' && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(action.text)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                <span>{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask a question..."
              disabled={disabled}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[40px] max-h-32"
              style={{ height: 'auto' }}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSymptomsSelector(!showSymptomsSelector)}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
              title="Symptom Analysis"
            >
              <BeakerIcon className="h-5 w-5" />
            </button>
            
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2 rounded-lg transition-colors ${
                message.trim() && !disabled
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isTyping ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isTyping && (
            <div className="flex items-center gap-1">
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 animate-pulse" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatbotInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onSymptomsAnalysis: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isTyping: PropTypes.bool
};

export default ChatbotInput;
