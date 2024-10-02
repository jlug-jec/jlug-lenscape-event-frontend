import {create} from 'zustand';

interface User {
  userId: string; // Assuming user has an ID
  name: string;
  picture: string;
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
  loadUser: () => void; // Method to load the user from local storage
}


const useStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },
  loadUser: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    set({ user });
  },
}));

export default useStore;
