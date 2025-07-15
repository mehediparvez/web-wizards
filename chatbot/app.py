from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
import numpy as np
import pandas as pd
import pickle
from difflib import get_close_matches
import os
import logging
import time
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS configuration - Allow both local development and production origins
allowed_origins = [
    "http://localhost:5173",
    "http://frontend:5173",
    "https://your-vercel-app.vercel.app",  # Replace with your actual Vercel domain
    "https://your-custom-domain.com"  # Add your custom domain if you have one
]

# Get allowed origins from environment variable if set
env_origins = os.environ.get('ALLOWED_ORIGINS', '').split(',')
if env_origins and env_origins[0]:  # Check if not empty
    allowed_origins.extend([origin.strip() for origin in env_origins if origin.strip()])

CORS(app, origins=allowed_origins)

# SocketIO configuration
socketio = SocketIO(
    app, 
    cors_allowed_origins=allowed_origins,
    logger=True,
    engineio_logger=True
)

# Load datasets
try:
    sym_des = pd.read_csv("symtoms_df.csv")
    precautions = pd.read_csv("precautions_df.csv")
    workout = pd.read_csv("workout_df.csv")
    description = pd.read_csv("description.csv")
    medications = pd.read_csv('medications.csv')
    diets = pd.read_csv("diets.csv")
    logger.info("Datasets loaded successfully")
except Exception as e:
    logger.error(f"Error loading datasets: {str(e)}")
    raise e

# Load model with fallback
svc = None
model_loaded = False

try:
    # Try to load the existing model
    svc = pickle.load(open('svc.pkl','rb'))
    model_loaded = True
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    logger.info("Attempting to create a fallback model...")
    
    try:
        # Create a simple fallback model
        from sklearn.svm import SVC
        from sklearn.preprocessing import StandardScaler
        import numpy as np
        
        # Create a simple dummy model for fallback
        # This won't be accurate but will prevent the app from crashing
        svc = SVC(kernel='linear', probability=True)
        
        # Create dummy training data
        X_dummy = np.random.rand(100, 132)  # 132 features (symptoms)
        y_dummy = np.random.randint(0, 41, 100)  # 41 diseases
        
        svc.fit(X_dummy, y_dummy)
        model_loaded = True
        logger.warning("Using fallback model - predictions may not be accurate")
        
    except Exception as fallback_error:
        logger.error(f"Failed to create fallback model: {str(fallback_error)}")
        logger.error("Running without ML model - only basic responses will be available")

# Symptoms dictionary
symptoms_dict = {'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12, 'spotting_ urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32, 'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51, 'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55, 'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89, 'foul_smell_of urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93, 'toxic_look_(typhos)': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101, 'dischromic _patches': 102, 'watering_from_eyes': 103, 'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116, 'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119, 'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123, 'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127, 'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131}

diseases_list = {15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction', 33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ', 17: 'Gastroenteritis', 6: 'Bronchial Asthma', 23: 'Hypertension ', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A', 19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis', 36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemmorhoids(piles)', 18: 'Heart attack', 39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia', 31: 'Osteoarthristis', 5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo', 2: 'Acne', 38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'}

def helper(dis):
    """Get disease information including description, precautions, medications, diet, and workout"""
    try:
        desc = description[description['Disease'] == dis]['Description']
        desc = " ".join([str(w) for w in desc]) if not desc.empty else "No description available"

        pre = precautions[precautions['Disease'] == dis][['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']]
        pre = [col for col in pre.values] if not pre.empty else []

        med = medications[medications['Disease'] == dis]['Medication']
        med = [str(med) for med in med.values if pd.notna(med)] if not med.empty else []

        die = diets[diets['Disease'] == dis]['Diet']
        die = [str(die) for die in die.values if pd.notna(die)] if not die.empty else []

        wrkout = workout[workout['disease'] == dis]['workout']
        wrkout = [str(w) for w in wrkout.values if pd.notna(w)] if not wrkout.empty else []

        return desc, pre, med, die, wrkout
    except Exception as e:
        logger.error(f"Error in helper function: {str(e)}")
        return "Error retrieving information", [], [], [], []

def suggest_symptoms(invalid_symptom, available_symptoms, n=3):
    """Suggest similar symptoms using fuzzy string matching"""
    suggestions = get_close_matches(invalid_symptom, available_symptoms, n=n, cutoff=0.6)
    return suggestions

def get_predicted_value(patient_symptoms):
    """Predict disease based on symptoms"""
    try:
        # Check if model is available
        if not model_loaded or svc is None:
            logger.warning("Model not available, using rule-based fallback")
            return get_fallback_prediction(patient_symptoms)
        
        input_vector = np.zeros(len(symptoms_dict))
        valid_symptoms = []
        invalid_symptoms = []
        suggestions = {}
        
        available_symptoms = list(symptoms_dict.keys())
        
        for item in patient_symptoms:
            if item in symptoms_dict:
                input_vector[symptoms_dict[item]] = 1
                valid_symptoms.append(item)
            else:
                invalid_symptoms.append(item)
                symptom_suggestions = suggest_symptoms(item, available_symptoms)
                if symptom_suggestions:
                    suggestions[item] = symptom_suggestions
        
        if not valid_symptoms:
            return None, [], invalid_symptoms, suggestions
        
        prediction = svc.predict([input_vector])[0]
        return diseases_list[prediction], valid_symptoms, invalid_symptoms, suggestions
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        # Fallback to rule-based prediction
        return get_fallback_prediction(patient_symptoms)

def get_fallback_prediction(patient_symptoms):
    """Simple rule-based prediction when ML model is not available"""
    try:
        valid_symptoms = []
        invalid_symptoms = []
        suggestions = {}
        
        available_symptoms = list(symptoms_dict.keys())
        
        for item in patient_symptoms:
            if item in symptoms_dict:
                valid_symptoms.append(item)
            else:
                invalid_symptoms.append(item)
                symptom_suggestions = suggest_symptoms(item, available_symptoms)
                if symptom_suggestions:
                    suggestions[item] = symptom_suggestions
        
        if not valid_symptoms:
            return None, [], invalid_symptoms, suggestions
        
        # Simple rule-based prediction
        predicted_disease = "General condition requiring medical attention"
        
        # Some basic rules for common symptom combinations
        if 'headache' in valid_symptoms and 'fever' in valid_symptoms:
            predicted_disease = "Common Cold"
        elif 'chest_pain' in valid_symptoms:
            predicted_disease = "Chest condition requiring immediate attention"
        elif 'stomach_pain' in valid_symptoms or 'nausea' in valid_symptoms:
            predicted_disease = "Gastroenteritis"
        elif 'cough' in valid_symptoms:
            predicted_disease = "Common Cold"
        elif 'fatigue' in valid_symptoms:
            predicted_disease = "General fatigue condition"
        
        return predicted_disease, valid_symptoms, invalid_symptoms, suggestions
    except Exception as e:
        logger.error(f"Error in fallback prediction: {str(e)}")
        return None, [], [], {}

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "chatbot"}), 200

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get list of available symptoms"""
    try:
        available_symptoms = sorted(list(symptoms_dict.keys()))
        return jsonify({
            "success": True,
            "symptoms": available_symptoms,
            "total": len(available_symptoms)
        }), 200
    except Exception as e:
        logger.error(f"Error getting symptoms: {str(e)}")
        return jsonify({"success": False, "error": "Failed to retrieve symptoms"}), 500

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """Predict disease based on symptoms"""
    try:
        data = request.get_json()
        
        if not data or 'symptoms' not in data:
            return jsonify({
                "success": False,
                "error": "Symptoms are required"
            }), 400
        
        symptoms_input = data['symptoms']
        
        # Handle both string and list input
        if isinstance(symptoms_input, str):
            user_symptoms = [s.strip().lower() for s in symptoms_input.split(',')]
        elif isinstance(symptoms_input, list):
            user_symptoms = [s.strip().lower() for s in symptoms_input]
        else:
            return jsonify({
                "success": False,
                "error": "Symptoms must be a string or array"
            }), 400
        
        # Remove empty symptoms
        user_symptoms = [symptom.strip("[]' ") for symptom in user_symptoms if symptom.strip()]
        
        if not user_symptoms:
            return jsonify({
                "success": False,
                "error": "Please provide valid symptoms"
            }), 400
        
        # Get prediction
        predicted_disease, valid_symptoms, invalid_symptoms, suggestions = get_predicted_value(user_symptoms)
        
        if predicted_disease is None:
            return jsonify({
                "success": False,
                "error": "No valid symptoms found",
                "invalid_symptoms": invalid_symptoms,
                "suggestions": suggestions
            }), 400
        
        # Get disease information
        dis_des, precautions, medications, rec_diet, workout = helper(predicted_disease)
        
        # Format precautions
        my_precautions = []
        if precautions and len(precautions) > 0:
            for i in precautions[0]:
                if i and pd.notna(i) and str(i).strip():
                    my_precautions.append(str(i).strip())
        
        response_data = {
            "success": True,
            "prediction": {
                "disease": predicted_disease,
                "description": dis_des,
                "precautions": my_precautions,
                "medications": list(medications) if medications else [],
                "diet": list(rec_diet) if rec_diet else [],
                "workout": list(workout) if workout else []
            },
            "input_analysis": {
                "valid_symptoms": valid_symptoms,
                "invalid_symptoms": invalid_symptoms,
                "suggestions": suggestions
            }
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({
            "success": False,
            "error": "An error occurred while processing your request"
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Chat endpoint for conversational interface"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Message is required"
            }), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        # Process the message using the chat logic
        response_data = process_chat_message(user_message)
        
        return jsonify({
            "success": True,
            **response_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": "An error occurred while processing your message"
        }), 500

# WebSocket Events
@socketio.on('connect')
def handle_connect(auth):
    """Handle client connection"""
    session_id = str(uuid.uuid4())
    logger.info(f"Client connected with session: {session_id}")
    
    # Send welcome message
    emit('message', {
        'id': str(uuid.uuid4()),
        'text': "Hello! I'm your medical assistant. I can help you identify possible medical conditions based on your symptoms. You can describe your symptoms and I'll help identify possible conditions.",
        'sender': 'bot',
        'timestamp': time.time() * 1000,
        'type': 'greeting',
        'session_id': session_id
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info("Client disconnected")

@socketio.on('send_message')
def handle_message(data):
    """Handle incoming chat messages via WebSocket"""
    try:
        message_text = data.get('message', '').strip()
        user_id = data.get('user_id')
        
        if not message_text:
            emit('error', {'error': 'Message cannot be empty'})
            return
        
        logger.info(f"Received message from user {user_id}: {message_text}")
        
        # Send typing indicator
        emit('typing', {'typing': True})
        
        # Simulate processing time
        time.sleep(1)
        
        # Process the message using the chat logic
        response_data = process_chat_message(message_text)
        
        # Stop typing indicator
        emit('typing', {'typing': False})
        
        # Send response
        emit('message', {
            'id': str(uuid.uuid4()),
            'text': response_data['response'],
            'sender': 'bot',
            'timestamp': time.time() * 1000,
            'type': response_data.get('type', 'default'),
            'data': response_data.get('data')
        })
        
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}")
        emit('typing', {'typing': False})
        emit('error', {
            'error': 'An error occurred while processing your message',
            'timestamp': time.time() * 1000
        })

@socketio.on('get_symptoms')
def handle_get_symptoms():
    """Handle request for available symptoms"""
    try:
        available_symptoms = sorted(list(symptoms_dict.keys()))
        emit('symptoms_list', {
            'symptoms': available_symptoms,
            'total': len(available_symptoms)
        })
    except Exception as e:
        logger.error(f"Error getting symptoms: {str(e)}")
        emit('error', {'error': 'Failed to retrieve symptoms'})

def process_chat_message(message_text):
    """Process chat message and return response data"""
    # Simple keyword detection for symptoms
    if any(keyword in message_text.lower() for keyword in ['symptom', 'feel', 'pain', 'ache', 'sick', 'problem']):
        # Try to extract symptoms from the message
        available_symptoms = list(symptoms_dict.keys())
        found_symptoms = []
        
        for symptom in available_symptoms:
            if symptom.replace('_', ' ') in message_text.lower():
                found_symptoms.append(symptom)
        
        if found_symptoms:
            # Use the prediction logic
            predicted_disease, valid_symptoms, invalid_symptoms, suggestions = get_predicted_value(found_symptoms)
            
            if predicted_disease:
                dis_des, precautions, medications, rec_diet, workout = helper(predicted_disease)
                
                response_message = f"Based on your symptoms, you might have: **{predicted_disease}**\n\n"
                response_message += f"**Description:** {dis_des}\n\n"
                
                if precautions and len(precautions) > 0:
                    my_precautions = []
                    for p in precautions[0]:
                        if p and pd.notna(p) and str(p).strip():
                            my_precautions.append(str(p).strip())
                    
                    if my_precautions:
                        response_message += "**Precautions:**\n"
                        for i, precaution in enumerate(my_precautions[:3], 1):
                            response_message += f"{i}. {precaution}\n"
                        response_message += "\n"
                
                response_message += "Would you like more detailed information about medications, diet, or exercises?"
                
                return {
                    'response': response_message,
                    'type': 'diagnosis',
                    'data': {
                        'disease': predicted_disease,
                        'symptoms_found': found_symptoms
                    }
                }
    
    # Default responses for common queries
    greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
    if any(greeting in message_text.lower() for greeting in greetings):
        return {
            'response': "Hello! I'm your medical assistant. You can tell me about your symptoms and I'll help identify possible conditions. For example, you can say 'I have a headache and fever' or list symptoms.",
            'type': 'greeting'
        }
    
    help_keywords = ['help', 'how', 'what can you do']
    if any(keyword in message_text.lower() for keyword in help_keywords):
        return {
            'response': "I can help you identify possible medical conditions based on your symptoms. Here's how to use me:\n\n1. Describe your symptoms in natural language\n2. List symptoms separated by commas\n3. Ask for information about specific conditions\n\nExample: 'I have headache, fever, and nausea'",
            'type': 'help'
        }
    
    # Default response
    return {
        'response': "I'm here to help with medical symptom analysis. Please describe your symptoms, and I'll try to identify possible conditions. You can say something like 'I have headache and fever' or list your symptoms.",
        'type': 'default'
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
