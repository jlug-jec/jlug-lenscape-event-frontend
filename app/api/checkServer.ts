import router from "next/router";
import { Dispatch, SetStateAction } from "react";
import { setTokens,clearTokens } from "@/lib/utils";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


export const checkServerStatus = async (setIsLoading: Dispatch<SetStateAction<boolean>>) => {
    try {
      const response = await fetch(API_URL, { method: "HEAD" });
      if (response.status === 200) setIsLoading(false);
    } catch (error) {
      console.error("Error checking server status:", error);
    }
  };

  
  export const exchangeCodeForTokens = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // If no code is present, return early with specific response
    if (!code) {
      return {
        response: 404,
        message: 'No code found in URL'
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/exchange-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      // Handle different response scenarios
      if (!response.ok) {
        return {
          response: response.status,
          message: `Failed to exchange code: ${response.statusText}`
        };
      }
      
      const data = await response.json();
      
      // Check if response has the expected user data
      if (!data?.user?.jwtToken || !data?.user?.user) {
        return {
          response: 404,
          message: 'Invalid response format: missing user data'
        };
      }
  
      // Store tokens if they exist
      await setTokens(data.user.jwtToken, data.user.refreshToken);
      
      // Clean up URL without reload (optional)
    //   window.history.replaceState({}, document.title, window.location.pathname);
      
      return {
        user: data.user,
        response: response.status
      };
      
    } catch (error) {
      console.error('Error exchanging code:', error);
      return {
        response: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  export const handleGoogleAuth = async () => {
      window.location.href = `${API_URL}/auth/google`;
      return null;

  };


export const regenerateJwtToken = async (refreshToken: string | undefined) => {
    try {
      const response = await fetch(`${API_URL}/auth/regenerate-jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      console.log('Refreshed JWT token:', data);
      return data;
    } catch (error) {
        clearTokens();
        return
     
      throw error;
    }
  }