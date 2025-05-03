import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useLoginMutation, useResendVerificationEmailMutation } from '../store/api/authApi';
import { useInitiateGoogleLoginMutation } from '../store/api/oauthApi';
import { AuthContext } from '../context/authContextDefinition';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  // RTK Query mutation hooks
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [initiateGoogleLogin, { isLoading: isGoogleLoading }] = useInitiateGoogleLoginMutation();
  const [resendVerification, { isLoading: isResending, isSuccess: isResendSuccess }] = useResendVerificationEmailMutation();
  
  // Combined loading state
  const isLoading = isLoginLoading || isGoogleLoading;

  // Listen for messages from the Google OAuth popup window and check for auth code in localStorage
  useEffect(() => {
    let authCheckInterval;
    
    // Check for auth code in localStorage (set by popup window)
    const checkForAuthCode = () => {
      const authCode = localStorage.getItem('google_auth_code');
      const authTimestamp = localStorage.getItem('google_auth_timestamp');
      
      // Only process recent auth codes (within last 30 seconds)
      const isRecent = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 30000;
      
      if (authCode && isRecent) {
        console.log('Found fresh auth code in localStorage, processing...');
        
        // Get any state parameter
        const authState = localStorage.getItem('google_auth_state');
        
        // Clear localStorage items
        localStorage.removeItem('google_auth_code');
        localStorage.removeItem('google_auth_state');
        localStorage.removeItem('google_auth_timestamp');
        
        // Use direct window location change to process the callback in the main window
        const redirectUri = `${window.location.origin}/google-callback`;
        window.location.href = `${redirectUri}?code=${authCode}${authState ? `&state=${authState}` : ''}`;
        
        return true;
      }
      return false;
    };
    
    // Set up polling to check for auth code (for when popup closes)
    authCheckInterval = setInterval(() => {
      const found = checkForAuthCode();
      if (found && authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    }, 500); // Check every 500ms
    
    // Also run check immediately when component mounts
    const hasAuthCode = checkForAuthCode();
    if (hasAuthCode && authCheckInterval) {
      clearInterval(authCheckInterval);
    }

    // Cleanup function to clear interval
    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');
      setEmailVerificationRequired(false);
      
      // Use RTK Query login mutation instead of authService
      const result = await login(data).unwrap();
      
      // Explicitly update authentication state in context
      if (result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if it's an unverified email error
      if (error?.data?.email_verified === false) {
        setEmailVerificationRequired(true);
        setUnverifiedEmail(error?.data?.email || data.email);
      } else {
        setErrorMessage(error.data?.detail || error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    
    // Use RTK Query mutation for Google login
    const redirectUri = `${window.location.origin}/google-callback`;
    initiateGoogleLogin(redirectUri).catch(error => {
      console.error('Failed to initiate Google login:', error);
      setErrorMessage('Failed to initiate Google login. Please try again.');
    });
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      // Remove frontend_url as it's now handled by backend environment variables
      await resendVerification({
        email: unverifiedEmail
      });
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mb-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Show verification required screen
  if (emailVerificationRequired) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="text-2xl font-bold mb-2">Email Not Verified</h2>
            <p>You need to verify your email address ({unverifiedEmail}) before logging in.</p>
          </div>
          
          {isResendSuccess ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
              <p>Verification email has been sent. Please check your inbox and spam folder.</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="mb-4">Didn't receive a verification email?</p>
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
          
          <Link
            to="/login"
            className="mt-4 text-blue-600 hover:text-blue-800 block"
            onClick={() => {
              setEmailVerificationRequired(false);
              setUnverifiedEmail('');
            }}
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm md:max-w-md lg:max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center font-mono">Log in</h2>
        {isLoading && (
          <div className="text-center mb-4">
            <LoadingSpinner />
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Type your email address"
              className={`w-full p-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="Type your password"
              className={`w-full p-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          {/* Forgot Password */}
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Link to Registration Page */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/registration" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>

        {/* Social Login Buttons */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 p-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition duration-300"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-gray-500">
          Forgot your password?
          <br />
          <a href="/terms" className="text-blue-500 hover:underline">
            Terms Of Use
          </a>{' '}
          |{' '}
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          <br />
        </p>
      </div>
    </div>
  );
};

export default Login;