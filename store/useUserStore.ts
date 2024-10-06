import {create} from 'zustand';

export interface User {
  _id: string | null ;
  name: string;
  picture: string;
  email:string
  instagramId?: string; 
  branch?: string; 
  collegeName?: string;
  isParticipant?: boolean;
  isOnboarded?: boolean;
  isTeamLeader?: boolean; 
  domains?: Domain[]; 
  
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
    localStorage.setItem('_id', JSON.stringify(user._id));
    set({ user });
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
