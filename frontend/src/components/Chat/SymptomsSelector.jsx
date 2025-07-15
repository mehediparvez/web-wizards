import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  PlusIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

const SymptomsSelector = ({ onSymptomsChange, initialSymptoms = [] }) => {
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState(initialSymptoms);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Mock symptoms data - in real app, this would come from the API
  const mockSymptoms = [
    'headache', 'fever', 'cough', 'fatigue', 'nausea', 'vomiting', 'diarrhea',
    'chest_pain', 'back_pain', 'muscle_pain', 'joint_pain', 'stomach_pain',
    'sore_throat', 'runny_nose', 'sneezing', 'shortness_of_breath',
    'dizziness', 'weakness', 'loss_of_appetite', 'weight_loss', 'weight_gain',
    'anxiety', 'depression', 'insomnia', 'skin_rash', 'itching'
  ];

  useEffect(() => {
    // Simulate API call to get symptoms
    setLoading(true);
    setTimeout(() => {
      setAvailableSymptoms(mockSymptoms);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onSymptomsChange(selectedSymptoms);
  }, [selectedSymptoms, onSymptomsChange]);

  const formatSymptom = (symptom) => {
    return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredSymptoms = availableSymptoms.filter(symptom =>
    !selectedSymptoms.includes(symptom) &&
    formatSymptom(symptom).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Your Symptoms
      </label>
      
      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedSymptoms.map((symptom) => (
            <span
              key={symptom}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800 border border-teal-200"
            >
              <CheckIcon className="h-3 w-3 mr-1" />
              {formatSymptom(symptom)}
              <button
                type="button"
                onClick={() => removeSymptom(symptom)}
                className="ml-2 hover:text-teal-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search symptoms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-2">Loading symptoms...</p>
              </div>
            ) : filteredSymptoms.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No symptoms found' : 'No more symptoms available'}
              </div>
            ) : (
              <div className="py-2">
                {filteredSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => addSymptom(symptom)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4 text-gray-400" />
                    {formatSymptom(symptom)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="mt-2 text-sm text-gray-500">
        Select symptoms you're experiencing. You can also type your symptoms naturally in the chat.
      </p>
    </div>
  );
};

SymptomsSelector.propTypes = {
  onSymptomsChange: PropTypes.func.isRequired,
  initialSymptoms: PropTypes.array
};

export default SymptomsSelector;
