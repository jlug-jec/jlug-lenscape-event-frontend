import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  userId: string
  name: string
  email: string
  profileComplete: boolean
  token: string
  // profile fields (set after profile setup)
  college?: string
  branch?: string
  year?: string
  bio?: string
  avatar?: string
  // voting tracking - one vote per category
  votedCategories?: string[]
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  updateProfile: (fields: Partial<AuthUser>) => void
  clearUser: () => void
  isLoggedIn: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => set({ user }),

      updateProfile: (fields) =>
        set(state => state.user ? { user: { ...state.user, ...fields } } : {}),

      clearUser: () => set({ user: null }),

      isLoggedIn: () => {
        const u = get().user
        return !!u?.token
      },
    }),
    {
      name: 'lenscape-auth', // localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user object
    }
  )
)
