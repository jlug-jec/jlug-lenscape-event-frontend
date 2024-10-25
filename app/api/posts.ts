import { toast } from 'react-toastify';
import { Post } from '../types/post';
import { authenticatedFetch } from '@/lib/auth.utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Safe localStorage access
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

export const postApi = {
  createPost: async (postData: Post) => {
    const jwtToken = getLocalStorageItem('jwtToken');
    const refreshToken = getLocalStorageItem('refreshToken');

    const response = await authenticatedFetch(`${API_URL}/api/posts/createPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Refresh-Token': refreshToken || ''
      },
      body: JSON.stringify(postData),
    });

    if (response.status === 400) {
      const message = await response.json();
      toast.error(message.message);
      throw new Error('Invalid image video format or link is inaccessible');
    }

    return await response.json();
  },

  editPost: async (postId: string, postData: Post) => {
    const jwtToken = getLocalStorageItem('jwtToken');
    const refreshToken = getLocalStorageItem('refreshToken');

    const response = await authenticatedFetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Refresh-Token': refreshToken || ''
      },
      body: JSON.stringify(postData),
    });

    if (response.status === 400) {
      const message = await response.json();
      toast.error(message.message);
      throw new Error('Invalid image video format or link is inaccessible');
    }

    if (!response.ok) {
      toast.error('Failed to edit post, Invalid image video format or link is inaccessible');
      throw new Error('Invalid image video format or link is inaccessible');
    }

    return await response.json();
  },

  getAllPosts: async () => {
    const response = await fetch(`${API_URL}/api/posts/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      toast.error('Failed to fetch posts');
      throw new Error('Failed to fetch posts');
    }

    return await response.json();
  },

  votePost: async (postId: string, userId: string | null) => {
    
    const jwtToken = getLocalStorageItem('jwtToken');
    const refreshToken = getLocalStorageItem('refreshToken');
    
    if (!jwtToken || !refreshToken || !userId) {
      toast.error('You need to login to vote');
      throw new Error('Authentication required');
    }

    const response = await authenticatedFetch(`${API_URL}/api/posts/vote/${postId}`, {
      method: 'POST',
      requireAuth: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Refresh-Token': refreshToken || ''
      },
      body: JSON.stringify({ "userId": userId }),
    });
    
    return response.json();
  },
  downvotePost: async (postId: string, userId: string | null) => {

    
    const jwtToken = getLocalStorageItem('jwtToken');
    const refreshToken = getLocalStorageItem('refreshToken');
    
    if (!jwtToken || !refreshToken || !userId) {
      toast.error('You need to login to vote');
      throw new Error('Authentication required');
    }

    const response = await authenticatedFetch(`${API_URL}/api/posts/downvote/${postId}`, {
      method: 'POST',
      requireAuth: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Refresh-Token': refreshToken || ''
      },
      body: JSON.stringify({ "userId": userId }),
    });
    
    return response.json();
  },

  // Add more methods as needed, for example:
  getPostById: async (postId: string) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      toast.error('Failed to fetch post');
      throw new Error('Failed to fetch post');
    }

    return await response.json();
  },

  deletePost: async (postId: string) => {
    const jwtToken = getLocalStorageItem('jwtToken');
    const refreshToken = getLocalStorageItem('refreshToken');

    const response = await authenticatedFetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'X-Refresh-Token': refreshToken || ''
      },
    });

    if (!response.ok) {
      toast.error('Failed to delete post');
      throw new Error('Failed to delete post');
    }

    return await response.json();
  }
};

// You might want to add a separate API object for user-related operations
export const userApi = {
  login: async (credentials: { email: string, password: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      toast.error('Login failed');
      throw new Error('Login failed');
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Add more user-related methods as needed
};