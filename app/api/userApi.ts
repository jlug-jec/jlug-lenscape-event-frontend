import { authenticatedFetch } from "@/lib/auth.utils";
import { Result } from "postcss";

let API_URL=process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getUserDetails(userId: string | undefined, jwtToken: string | null, refreshToken?: string) {
    try {
        const url = `${API_URL}/api/participant/users/${userId}`;
        
        // Use authenticatedFetch instead of direct fetch call
        const response = await authenticatedFetch(url, {
          method: 'GET',
          requireAuth: true, // Ensure the fetch is authenticated
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'X-Refresh-Token': refreshToken || ''
          }
        });
        
        if (response.ok) {
          let result = await response.json();
          return result;
        } else if (response.status === 404) {
          throw new Error('User not found');
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else {
          throw new Error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
      }
    }

    

