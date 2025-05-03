import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import { AuthContext } from '../context/authContextDefinition';
import { useContext } from 'react';

/**
 * Component to handle Google OAuth callback
 */
const GoogleCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { loginWithGoogle } = useContext(AuthContext);
  const codeProcessed = useRef(false);
  const isPopup = useRef(window.opener && window.opener !== window); // Check if this is a popup window

  // Close popup immediately if detected - even before useEffect runs
  // This serves as a backup if the script in index.html didn't work
  if (isPopup.current && window.opener) {
    try {
      // Extract code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code) {
        // Store in localStorage for main window
        localStorage.setItem('google_auth_code', code);
        if (state) {
          localStorage.setItem('google_auth_state', state);
        }
        localStorage.setItem('google_auth_timestamp', Date.now().toString());
      }
      
      // Close immediately
      console.log('GoogleCallback component closing popup immediately');
      window.close();
    } catch (err) {
      console.error('Error in immediate popup close logic:', err);
      // Still try to close
      window.close();
    }
  }

  useEffect(() => {
    // Define a simple function to redirect to dashboard after successful login
    const redirectToDashboard = () => {
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    };

    const processCallback = async () => {
      try {
        // Prevent double processing
        if (codeProcessed.current) {
          return;
        }

        // Skip further processing if in popup - redundant check as a fallback
        if (isPopup.current && window.opener) {
          window.close();
          return;
        }

        // Extract authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('error');
          setError('No authorization code found in the URL.');
          return;
        }

        codeProcessed.current = true;
        
        // Only process in main window
        console.log("Main window processing OAuth callback");
        
        // Get the current redirect URI
        const redirectUri = `${window.location.origin}/google-callback`;
        
        // Process the callback
        await loginWithGoogle({
          code: code,
          redirectUri: redirectUri
        });
        
        setStatus('success');
        redirectToDashboard();
      } catch (err) {
        console.error("Google OAuth callback error:", err);
        setStatus('error');
        setError(err.data?.detail || err.message || 'Failed to process Google login');
        
        // Navigate to login after error in main window
        if (!isPopup.current) {
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      }
    };

    // Don't run the effect in popup windows at all
    if (!isPopup.current) {
      processCallback();
    }
  }, [navigate, loginWithGoogle]);

  // Don't render anything in popup windows
  if (isPopup.current) {
    return null;
  }

  // Component rendering based on status
  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingScreen size="large" />
        <h2 className="mt-4 text-xl font-medium">Processing Google login...</h2>
        <p className="mt-2 text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-medium text-red-600">Authentication Failed</h2>
        <p className="mt-2 text-gray-600">{error || 'An unexpected error occurred'}</p>
        <p className="mt-1 text-gray-500">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-medium text-green-600">Login Successful!</h2>
      <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
    </div>
  );
};

export default GoogleCallback;