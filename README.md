# AmarHealth - Your Complete Healthcare Companion

## Team Members
- **Md. Mehedi Hasan Parvez** - [mehediparvez](https://github.com/mehediparvez) (Team Leader)
- **Faysal Ahammed** - [Faysal0009](https://github.com/Faysal0009)
- **Ishtiak Ahmed** - [YEAD007](https://github.com/YEAD007)

## Mentor
- **Mohammad Ahad** - [maahad767](https://github.com/maahad767)

## Project Description
AmarHealth (Ibn Sina Health) is a comprehensive healthcare management platform designed to empower users with complete control over their medical data. Our solution connects patients with healthcare providers, simplifies medical record management, and provides AI-powered insights for better healthcare decision-making.

## Project Structure
The application is built with a modern tech stack and follows a microservices architecture:

### Backend
- **Django REST Framework**: Core API services for user management, medical records, appointments
- **PostgreSQL**: Primary database
- **Redis**: Caching and background task management
- **Celery**: Asynchronous task processing

### Frontend
- **React**: Single-page application with modular component structure
- **Redux Toolkit**: State management with RTK Query for API interactions
- **TailwindCSS**: Utility-first CSS framework for styling

### OCR Service
- **FastAPI**: High-performance OCR and document processing service
- **AI Processing**: Integration with OpenAI/Gemini models for medical document analysis

### Chatbot Service
- **Flask + SocketIO**: Real-time medical AI assistant
- **Machine Learning**: Symptom analysis and disease prediction
- **WebSocket Support**: Real-time chat functionality
- **REST API**: HTTP-based chat interactions

### DevOps
- **Docker & Docker Compose**: Containerization
- **Azure Container Apps**: Cloud deployment platform
- **GitHub Actions**: CI/CD pipeline automation

## Features

### User Management
- Secure account creation and authentication
- Profile management and preferences
- Two-factor authentication

### Medical Records
- Health issue tracking
- Symptom recording and monitoring
- Document management with smart OCR processing
- Lab result tracking and visualization

### Appointment Management
- Schedule appointments with healthcare providers
- Appointment reminders and notifications
- Video consultation preparation

### Medication Management
- Medication tracking and reminders
- Prescription management
- Refill notifications

### Clinician Portal
- Provider profiles and specializations
- Review system and ratings
- Availability management

### OCR & AI Features
- Automated extraction of test results from uploaded documents
- Parameter classification and abnormality detection
- Trend analysis and visualization

### AI Medical Assistant
- **Real-time Chat**: Interactive medical consultation with AI
- **Symptom Analysis**: Intelligent symptom-to-disease prediction
- **Health Guidance**: Personalized health recommendations
- **Multi-format Support**: Both text input and structured symptom selection
- **WebSocket Integration**: Real-time messaging with typing indicators

## Getting Started
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/web-wizards.git
   cd web-wizards
   ```

2. Install Dependencies
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   
   # OCR Service
   cd ../ocr_service
   pip install -r requirements.txt
   
   # Chatbot Service
   cd ../chatbot
   pip install -r requirements.txt
   ```

3. Set Up Environment Variables
   - Create `.env` file in the root directory based on `.env.example`
   - Configure API URLs and service endpoints

4. Start Development Servers
   ```bash
   # Using Docker Compose (Recommended)
   docker-compose up
   
   # This will start:
   # - Frontend (React): http://localhost:5173
   # - Backend (Django): http://localhost:8000
   # - OCR Service (FastAPI): http://localhost:8001
   # - Chatbot Service (Flask): http://localhost:5000
   # - Database (MySQL): localhost:3306
   ```

## Service Endpoints
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **OCR Service**: http://localhost:8001
- **Chatbot Service**: http://localhost:5000
- **Database**: localhost:3306

## Development Guidelines
1. Create feature branches from the `develop` branch
   ```bash
   git checkout -b feature/your-feature develop
   ```

2. Make small, focused commits with descriptive messages
   ```bash
   git commit -m "feat: implement lab result visualization component"
   ```

3. Follow the migrations guide for database changes
   ```bash
   git checkout migrations
   # Make model changes and create migrations
   python manage.py makemigrations
   ```

4. Create pull requests for review

## Documentation
- [API Documentation](https://amarhealth.tech/api/docs)
- [Development Setup](https://amarhealth.tech/docs/setup)
- [Database Schema](https://amarhealth.tech/docs/schema)
- [OCR Service Integration](https://amarhealth.tech/docs/ocr-service)
- [Contribution Guidelines](https://amarhealth.tech/docs/contributing)

## Resources
- [Project Documentation](docs/)
- [Development Setup](docs/setup.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Migrations Guide](MIGRATIONS_GUIDE.md)
