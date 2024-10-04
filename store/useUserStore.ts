import {create} from 'zustand';

export interface User {
  userId: string | null ; // Assuming user has an ID
  name: string;
  picture: string;
  email:string
  instagramId?: string; // Optional field
  branch?: string; // Optional field
  isParticipant?: boolean; // Optional field
  domains?: Domain[]; // Optional field, where Domain is another interface
}

interface Domain {
  type: string; // e.g., "photography"
  link: string; // Link associated with the domain
}

interface UserStore {
  user: User | null; // The user object or null if not authenticated
  setUser: (user: User) => void; // Method to set the user
  loadUser: () => User | null;  // Method to load the user from local storage
}


const useStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },
  loadUser: () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      set({ user });
      return user; // Return the loaded user
    } catch (error) {
      return null;
    }
  }  
}));

export default useStore;
