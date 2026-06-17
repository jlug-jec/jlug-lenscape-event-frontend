import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { useAuthStore } from './store/authStore'
import { syncUserProfile } from './lib/session'

// On boot: if Zustand store has no user but we have legacy localStorage token,
// hydrate the store from legacy keys so the user stays logged in across deploys.
const bootstrapAuth = () => {
  const storeUser = useAuthStore.getState().user
  if (!storeUser?.token) {
    const token = localStorage.getItem('lenscape_user_token')
    if (token) {
      useAuthStore.getState().setUser({
        token,
        userId: localStorage.getItem('lenscape_user_id') || '',
        name: localStorage.getItem('lenscape_user_name') || '',
        email: localStorage.getItem('lenscape_user_email') || '',
        profileComplete: localStorage.getItem('lenscape_profile_complete') === 'true',
        college: localStorage.getItem('lenscape_user_college') || undefined,
        branch: localStorage.getItem('lenscape_user_branch') || undefined,
        bio: localStorage.getItem('lenscape_user_bio') || undefined,
        avatar: localStorage.getItem('lenscape_user_avatar') || undefined,
      })
    }
  }
}

bootstrapAuth()

// Fetch full user profile from backend so all fields are up to date
syncUserProfile()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
