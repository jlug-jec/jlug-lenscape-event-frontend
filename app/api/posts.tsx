const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const postApi = {
    createPost: async (postData) => {
        console.log(postData)
      const response = await fetch(`${API_URL}/api/posts/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
  
      return await response.json();
    },
  
    editPost: async (postId, postData) => {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to edit post');
      }
  
      return await response.json();
    }
  };
  