import { regenerateJwtToken } from "@/app/api/checkServer";
import { Router } from "next/router";
// authUtils.ts
interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
  }
  
  interface RequestConfig extends RequestInit {
    requireAuth?: boolean;
  }
  
  export class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export const authenticatedFetch = async (
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> => {
    const { requireAuth = true, headers: customHeaders, ...restConfig } = config;
    
    let jwtToken = localStorage.getItem('jwtToken');
    let refreshToken = localStorage.getItem('refreshToken');
  
    // Check if authentication is required and tokens are missing
    if (requireAuth && (!jwtToken || !refreshToken)) {
      throw new AuthError('Authentication required');
    }
  
    // First attempt with current token
    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: {
          'Content-Type': 'application/json',
          ...(requireAuth && {
            'Authorization': `Bearer ${jwtToken}`,
            'X-Refresh-Token': refreshToken || ''
          }),
          ...customHeaders,
        },
      });
  
      // If response is OK, return it
      if (response.ok) {
        return response;
      }
  
      // Handle 401 (Unauthorized) error
      if (response.status === 401 && refreshToken) {
        // Try to regenerate token
        const newTokens = await regenerateJwtToken(refreshToken);
        if(newTokens.status===403){
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
        }
        if (!newTokens?.accessToken) {
          throw new AuthError('Failed to refresh authentication');
        }
  
        // Save new tokens
        localStorage.setItem('jwtToken', newTokens.accessToken);
        if (newTokens.refreshToken) {
          localStorage.setItem('refreshToken', newTokens.refreshToken);
        }
  
        // Retry request with new token
        const retryResponse = await fetch(url, {
          ...restConfig,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newTokens.accessToken}`,
            'X-Refresh-Token': refreshToken,
            ...customHeaders,
          },
        });
  
        return retryResponse;
      }
  
      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  };