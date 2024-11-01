import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const setTokens = (jwtToken:string, refreshToken:string) => {
  localStorage.setItem('jwtToken', jwtToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('refreshToken');
};

export const getOptimizedDriveUrl = (url: string): string => {
  try {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    if (!fileId) throw new Error('Invalid Drive URL');
    // Use the direct download URL format which is typically faster
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch {
    return url;
  }
};


export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};



