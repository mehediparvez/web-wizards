#!/usr/bin/env python3
"""
Model retraining script for chatbot service
This script retrains the ML model with the current environment's numpy version
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
import pickle
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_training_data():
    """Load and prepare training data"""
    try:
        # Load training data
        training_data = pd.read_csv("Training.csv")
        logger.info(f"Training data loaded with shape: {training_data.shape}")
        
        # Prepare features (symptoms) and target (disease)
        X = training_data.drop('prognosis', axis=1)
        y = training_data['prognosis']
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Target shape: {y.shape}")
        logger.info(f"Unique diseases: {len(y.unique())}")
        
        return X, y
    except FileNotFoundError:
        logger.error("Training.csv file not found")
        raise
    except Exception as e:
        logger.error(f"Error loading training data: {str(e)}")
        raise


def create_disease_mapping(y):
    """Create mapping from disease names to numbers"""
    unique_diseases = sorted(y.unique())
    disease_to_id = {disease: idx 
                     for idx, disease in enumerate(unique_diseases)}
    id_to_disease = {idx: disease 
                     for idx, disease in enumerate(unique_diseases)}
    
    logger.info(f"Created mapping for {len(unique_diseases)} diseases")
    return disease_to_id, id_to_disease


def train_model(X, y):
    """Train the SVM model"""
    try:
        # Create disease mapping
        disease_to_id, id_to_disease = create_disease_mapping(y)
        
        # Convert disease names to numbers
        y_encoded = y.map(disease_to_id)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        logger.info(f"Training set size: {X_train.shape[0]}")
        logger.info(f"Test set size: {X_test.shape[0]}")
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train SVM model
        logger.info("Training SVM model...")
        svc = SVC(kernel='rbf', probability=True, random_state=42)
        svc.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        train_score = svc.score(X_train_scaled, y_train)
        test_score = svc.score(X_test_scaled, y_test)
        
        logger.info(f"Training accuracy: {train_score:.4f}")
        logger.info(f"Test accuracy: {test_score:.4f}")
        
        return svc, scaler, id_to_disease
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        raise


def save_model(svc, scaler, id_to_disease):
    """Save the trained model and associated objects"""
    try:
        # Save the SVM model
        with open('svc.pkl', 'wb') as f:
            pickle.dump(svc, f)
        logger.info("SVM model saved to svc.pkl")
        
        # Save the scaler
        with open('scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        logger.info("Scaler saved to scaler.pkl")
        
        # Save disease mapping
        with open('disease_mapping.pkl', 'wb') as f:
            pickle.dump(id_to_disease, f)
        logger.info("Disease mapping saved to disease_mapping.pkl")
        
        # Save model metadata
        metadata = {
            'numpy_version': np.__version__,
            'pandas_version': pd.__version__,
            'sklearn_version': '1.3.0',  # Based on requirements
            'model_type': 'SVM',
            'feature_count': svc.n_features_in_,
            'class_count': len(id_to_disease)
        }
        
        with open('model_metadata.pkl', 'wb') as f:
            pickle.dump(metadata, f)
        logger.info("Model metadata saved to model_metadata.pkl")
        
    except Exception as e:
        logger.error(f"Error saving model: {str(e)}")
        raise


def main():
    """Main training function"""
    try:
        logger.info("Starting model training...")
        logger.info(f"NumPy version: {np.__version__}")
        logger.info(f"Pandas version: {pd.__version__}")
        
        # Load training data
        X, y = load_training_data()
        
        # Train model
        svc, scaler, id_to_disease = train_model(X, y)
        
        # Save model
        save_model(svc, scaler, id_to_disease)
        
        logger.info("Model training completed successfully!")
        
        # Test the saved model
        logger.info("Testing saved model...")
        with open('svc.pkl', 'rb') as f:
            loaded_svc = pickle.load(f)
        
        # Create a test prediction
        test_input = np.zeros(X.shape[1])
        test_input[0] = 1  # Set first symptom
        test_prediction = loaded_svc.predict([test_input])
        
        logger.info(f"Test prediction successful: {test_prediction[0]}")
        logger.info("Model is ready for use!")
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise


if __name__ == "__main__":
    main()
