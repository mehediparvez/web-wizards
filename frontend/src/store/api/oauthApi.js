import apiService from './apiService';
import { tokenService } from '../../services/tokenService';

/**
 * OAuth API service for handling third-party authentication providers.
 * All OAuth flows (Google, etc.) should be managed here rather than in authApi.
 */
export const oauthApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    // Get Google OAuth URL
    getGoogleAuthUrl: builder.query({
      query: (redirectUri = window.location.origin + '/google-callback') => ({
        url: `users/google/login/?redirect_uri=${encodeURIComponent(redirectUri)}`,
        method: 'GET',
      }),
    }),

    // Initiate Google OAuth login process
    initiateGoogleLogin: builder.mutation({
      query: (redirectUri = window.location.origin + '/google-callback') => {
        // Always use the registered callback URL that's configured in Google Cloud Console
        return {
          url: `users/google/login/?redirect_uri=${encodeURIComponent(redirectUri)}`,
          method: 'GET',
        };
      },
      // Custom response handler for redirects
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.auth_url) {
            // Open Google auth in a popup with proper dimensions
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            
            console.log("Opening Google auth popup");
            
            // Open popup with fixed dimensions
            const authWindow = window.open(
              data.auth_url,
              'GoogleAuth',
              `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=yes,status=yes`
            );
            
            if (authWindow) {
              authWindow.focus();
            } else {
              console.error("Failed to open popup window - it may have been blocked by the browser");
              // Fallback to direct navigation if popup is blocked
              window.location.href = data.auth_url;
            }
          }
        } catch (err) {
          console.error('Google login initiation error:', err);
        }
      },
    }),
    
    // Process Google OAuth callback
    processGoogleCallback: builder.mutation({
      query: (data) => {
        // Ensure both code and redirect_uri are properly sent
        const payload = {
          code: data.code
        };
        
        // Only include redirect_uri if it exists
        if (data.redirect_uri) {
          payload.redirect_uri = data.redirect_uri;
        }
        
        return {
          url: 'users/google/callback/',
          method: 'POST',
          body: payload,
          credentials: 'include', // Include cookies in requests
        };
      },
      
      // Better error handling and state management
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          
          // Securely store tokens
          if (data.access) tokenService.setAccessToken(data.access);
          if (data.refresh) tokenService.setRefreshToken(data.refresh);
          
          // Update user state if user data is provided
          if (data.user) {
            dispatch({ type: 'user/setUser', payload: data.user });
          }
          
          console.log("Google OAuth callback processed successfully");
        } catch (err) {
          console.error('Google login processing failed:', err);
          // Make sure to clear any tokens on failure
          tokenService.clearTokens();
        }
      },
    }),

    // Template for adding future OAuth providers
    // Example: processGithubCallback, processMicrosoftCallback, etc.
  }),
});

export const {
  useGetGoogleAuthUrlQuery,
  useInitiateGoogleLoginMutation,
  useProcessGoogleCallbackMutation,
} = oauthApi;