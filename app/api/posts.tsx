const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { Post } from '../types/post';
export const postApi = {
    createPost: async (postData:Post) => {
      const response = await fetch(`${API_URL}/api/posts/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error('Invalid image video format or link is inaccessible');
      }
  
      return await response.json();
    },
  
    editPost: async (postId:string, postData:Post) => {
 
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error('Invalid image video format or link is inaccessible');
      }
  
      return await response.json();
    }
  };
  