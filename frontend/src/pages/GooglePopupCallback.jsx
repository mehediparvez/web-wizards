import React, { useEffect } from 'react';

/**
 * Special handler for Google OAuth popup callbacks only.
 * This component immediately passes the auth code to the parent window
 * and closes itself without processing the authentication.
 */
const GooglePopupCallback = () => {
  useEffect(() => {
    // Execute this as soon as the component mounts
    try {
      // Extract the auth code from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code) {
        console.error('No authorization code found in the popup callback');
        window.close();
        return;
      }
      
      console.log('Popup received auth code, redirecting main window...');
      
      // Redirect the parent window to the real callback URL
      if (window.opener) {
        const mainCallbackUrl = `${window.location.origin}/google-callback?code=${code}${state ? `&state=${state}` : ''}`;
        
        // Set the parent window location to the callback URL with the code
        window.opener.location.href = mainCallbackUrl;
        
        // Close the popup immediately
        setTimeout(() => {
          window.close();
        }, 100);
      } else {
        console.error('No opener window found - this page should only be opened as a popup');
        window.close();
      }
    } catch (error) {
      console.error('Error in popup callback:', error);
      // Try to close anyway
      window.close();
    }
  }, []);
  
  // Very minimal UI just in case the popup doesn't close immediately
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p className="text-center mb-4">Authentication successful!</p>
      <p className="text-sm text-gray-500">This window will close automatically...</p>
    </div>
  );
};

export default GooglePopupCallback;