const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
import { toast } from 'react-toastify';
import { Post } from '../types/post';
import { m } from 'framer-motion';
export const postApi = {
    createPost: async (postData:Post,refreshToken:string|undefined|null,jwtToken:string|undefined|null) => {

      const response = await fetch(`${API_URL}/api/posts/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`, // Include JWT
          'X-Refresh-Token': refreshToken || '' // Optional: will be undefined if not present
      
        },
        body: JSON.stringify(postData),
      });

      if (response.status === 400) {
        const message=await response.json();
        toast.error(message.message);
        throw new Error('Invalid image video format or link is inaccessible');
       
      }
  
      return await response.json();
    },
  
    editPost: async (postId:string, postData:Post,refreshToken:string|undefined|null,jwtToken:string|undefined|null) => {
 
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`, // Include JWT
          'X-Refresh-Token': refreshToken || '' // Optional: will be undefined if not present
      
        },
        body: JSON.stringify(postData),
      });
      if(response.status === 400){
        const message=await response.json();
        toast.error(message.message);
        throw new Error('Invalid image video format or link is inaccessible');
      }
      if (!response.ok) {

        toast.error('Failed to edit post, Invalid image video format or link is inaccessible');
        throw new Error('Invalid image video format or link is inaccessible');
      }
  
      return await response.json();
    }
  };
  