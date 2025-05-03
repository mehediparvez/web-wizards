import { lazy, Suspense, useContext, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// Import core components directly
import Home from './pages/Home';
import LoadingScreen from './components/common/LoadingScreen';
import { AuthProvider } from './context/authContext';
import { AuthContext } from './context/authContextDefinition';
import SentryErrorBoundary from './components/common/SentryErrorBoundary';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';

// Lazy load other components
const Login = lazy(() => import('./pages/Login'));
const Registration = lazy(() => import('./pages/Registration'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const GooglePopupCallback = lazy(() => import('./pages/GooglePopupCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Medication = lazy(() => import('./pages/Medication'));
const Clinicians = lazy(() => import('./pages/Clinicians'));
const ClinicianDetail = lazy(() => import('./pages/ClinicianDetail'));
const DiagnosticCenterDetail = lazy(() => import('./pages/DiagnosticCenterDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HealthIssues = lazy(() => import('./pages/HealthIssues'));
const HealthIssueDetail = lazy(() => import('./pages/HealthIssueDetail'));
const HealthIssueFormPage = lazy(() => import('./pages/HealthIssueFormPage'));
const Chat = lazy(() => import('./pages/Chat'));
const Appointments = lazy(() => import('./pages/Appointments'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
// Import News pages
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));

// Updated imports for Medical Record pages
const MedicalRecordLayout = lazy(() => import('./layouts/MedicalRecordLayout'));
const PatientMedicalProfile = lazy(() => import('./pages/PatientMedicalProfile'));
const Documents = lazy(() => import('./pages/Documents'));
const Logbook = lazy(() => import('./pages/Logbook'));
const LabResult = lazy(() => import('./pages/LabResult'));
const Symptoms = lazy(() => import('./pages/Symptoms'));
const Charts = lazy(() => import('./pages/Charts'));

// Fallback loading component
const PageLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? element : null;
};

PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  console.log(isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? element : null;
};

PublicRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

// Define router configuration with lazy loading
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  // Add News routes
  {
    path: "/news",
    element: (
      <Suspense fallback={<PageLoading />}>
        <News />
      </Suspense>
    ),
  },
  {
    path: "/news/:slug",
    element: (
      <Suspense fallback={<PageLoading />}>
        <NewsDetail />
      </Suspense>
    ),
  },
  {
    path: "/registration",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <Registration />
      </Suspense>
    } />,
  },
  {
    path: "/login",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <Login />
      </Suspense>
    } />,
  },
  {
    path: "/forgot-password",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <ForgotPassword />
      </Suspense>
    } />,
  },
  {
    path: "/reset-password",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <ResetPassword />
      </Suspense>
    } />,
  },
  {
    path: "/google-callback",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <GoogleCallback />
      </Suspense>
    } />,
  },
  {
    path: "/google-popup-callback",
    element: (
      <Suspense fallback={<PageLoading />}>
        <GooglePopupCallback />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Dashboard />
      </Suspense>
    } />,
  },
  {
    path: "/medicalrecord",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <MedicalRecordLayout />
      </Suspense>
    } />,
    children: [
      {
        path: "", // Add an index route if needed
        element: <Suspense fallback={<PageLoading />}>
          <PatientMedicalProfile />
        </Suspense>
      },
      {
        path: "logbook",
        element: <Suspense fallback={<PageLoading />}>
          <Logbook />
        </Suspense>
      },
      {
        path: "charts",
        element: <Suspense fallback={<PageLoading />}>
          <Charts />
        </Suspense>
      },
      {
        path: "symptoms",
        element: <Suspense fallback={<PageLoading />}>
          <Symptoms />
        </Suspense>
      },
      {
        path: "labresult",
        element: <Suspense fallback={<PageLoading />}>
          <LabResult />
        </Suspense>
      },
      {
        path: "documents",
        element: <Suspense fallback={<PageLoading />}>
          <Documents />
        </Suspense>
      }
    ]
  },
  // Updated Health Issues Routes
  {
    path: "/health-issues",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <HealthIssues />
      </Suspense>
    } />,
  },
  { 
    path: "/health-issues/:id",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <HealthIssueDetail />
      </Suspense>
    } />,
  },
  {
    path: "/health-issues/:id/:recordType/new",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <HealthIssueFormPage />
      </Suspense>
    } />,
  },
  {
    path: "/health-issues/:id/edit",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <HealthIssueFormPage />
      </Suspense>
    } />,
  },
  // Legacy route for backward compatibility
  {
    path: "/healthissues",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <HealthIssues />
      </Suspense>
    } />,
  },
  {
    path: "/chat",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Chat />
      </Suspense>
    } />,
  },
  {
    path: "/appointments",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Appointments />
      </Suspense>
    } />,
  },
  {
    path: "/settings",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Settings />
      </Suspense>
    } />,
  },
  {
    path: "/medication",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Medication />
      </Suspense>
    } />,
  },
  // Clinicians routes
  {
    path: "/clinicians",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <Clinicians />
      </Suspense>
    } />,
  },
  {
    path: "/clinicians/physician/:id",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <ClinicianDetail />
      </Suspense>
    } />,
  },
  {
    path: "/clinicians/diagnostic-center/:id",
    element: <PrivateRoute element={
      <Suspense fallback={<PageLoading />}>
        <DiagnosticCenterDetail />
      </Suspense>
    } />,
  },
  {
    path: "/verify-email/:token",
    element: <PublicRoute element={
      <Suspense fallback={<PageLoading />}>
        <VerifyEmail />
      </Suspense>
    } />,
  },
  {
    path: "*",
    element: <Suspense fallback={<PageLoading />}>
      <NotFound />
    </Suspense>,
  },
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SentryErrorBoundary>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </SentryErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

export default App;