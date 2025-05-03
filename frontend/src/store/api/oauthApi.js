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
      query: (redirectUri = window.location.origin + '/google-callback') => ({
        url: `users/google/login/?redirect_uri=${encodeURIComponent(redirectUri)}`,
        method: 'GET',
      }),
      // Custom response handler for redirects
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.auth_url) {
            // Redirect to Google's OAuth screen
            // Open in a new window/tab to avoid the disallowed_useragent error
            // This forces the browser to use a standard user agent which Google accepts
            window.open(data.auth_url, '_self');
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