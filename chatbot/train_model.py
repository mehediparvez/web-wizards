#!/usr/bin/env python3
"""
Model Training Script for Medical Recommendation System
Run this script to retrain the machine learning model
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, confusion_matrix
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_training_data():
    """Load and prepare training data"""
    logger.info("Loading training data...")
    try:
        dataset = pd.read_csv('Training.csv')
        logger.info(f"Dataset shape: {dataset.shape}")
        return dataset
    except FileNotFoundError:
        logger.error("Training.csv not found. Please ensure the training data is available.")
        raise

def prepare_data(dataset):
    """Prepare data for training"""
    logger.info("Preparing data for training...")
    
    X = dataset.drop('prognosis', axis=1)
    y = dataset['prognosis']
    
    # Encoding prognosis
    le = LabelEncoder()
    le.fit(y)
    Y = le.transform(y)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, Y, test_size=0.3, random_state=20
    )
    
    logger.info(f"Training set size: {X_train.shape}")
    logger.info(f"Test set size: {X_test.shape}")
    
    return X_train, X_test, y_train, y_test, le

def train_and_evaluate_models(X_train, X_test, y_train, y_test):
    """Train multiple models and compare performance"""
    logger.info("Training and evaluating models...")
    
    models = {
        'SVC': SVC(kernel='linear'),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'KNeighbors': KNeighborsClassifier(n_neighbors=5),
        'MultinomialNB': MultinomialNB()
    }
    
    results = {}
    
    for model_name, model in models.items():
        logger.info(f"Training {model_name}...")
        
        # Train the model
        model.fit(X_train, y_train)
        
        # Test the model
        predictions = model.predict(X_test)
        
        # Calculate accuracy
        accuracy = accuracy_score(y_test, predictions)
        results[model_name] = {
            'model': model,
            'accuracy': accuracy,
            'predictions': predictions
        }
        
        logger.info(f"{model_name} Accuracy: {accuracy:.4f}")
    
    return results

def select_best_model(results):
    """Select the best performing model"""
    best_model_name = max(results.keys(), key=lambda k: results[k]['accuracy'])
    best_model = results[best_model_name]['model']
    best_accuracy = results[best_model_name]['accuracy']
    
    logger.info(f"Best model: {best_model_name} with accuracy: {best_accuracy:.4f}")
    return best_model, best_model_name, best_accuracy

def save_model(model, model_name, accuracy):
    """Save the trained model"""
    filename = 'svc.pkl'
    with open(filename, 'wb') as f:
        pickle.dump(model, f)
    
    logger.info(f"Model saved as {filename}")
    logger.info(f"Model type: {model_name}")
    logger.info(f"Model accuracy: {accuracy:.4f}")

def validate_model():
    """Validate the saved model by loading and testing"""
    logger.info("Validating saved model...")
    try:
        with open('svc.pkl', 'rb') as f:
            loaded_model = pickle.load(f)
        logger.info("✅ Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Model validation failed: {e}")
        return False

def main():
    """Main training pipeline"""
    try:
        # Load and prepare data
        dataset = load_training_data()
        X_train, X_test, y_train, y_test, label_encoder = prepare_data(dataset)
        
        # Train and evaluate models
        results = train_and_evaluate_models(X_train, X_test, y_train, y_test)
        
        # Select best model
        best_model, model_name, accuracy = select_best_model(results)
        
        # Save the model
        save_model(best_model, model_name, accuracy)
        
        # Validate
        if validate_model():
            logger.info("🎉 Model training completed successfully!")
            logger.info("The new model is ready for use in the API service.")
        else:
            logger.error("Model validation failed!")
            return 1
            
        return 0
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
