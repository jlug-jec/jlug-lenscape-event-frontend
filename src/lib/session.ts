/**
 * Session helpers — synchronous reads/writes backed by Zustand + localStorage.
 */
import { useAuthStore } from '../store/authStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface SessionData {
  token: string
  userId: string
  name: string
  email: string
  profileComplete: boolean
  college?: string
  branch?: string
  bio?: string
  avatar?: string
}

export function saveSession(data: SessionData) {
  // Write to Zustand store synchronously
  useAuthStore.getState().setUser({
    userId: data.userId,
    name: data.name || '',
    email: data.email,
    profileComplete: data.profileComplete,
    token: data.token,
    college: data.college,
    branch: data.branch,
    bio: data.bio,
    avatar: data.avatar,
  })

  // Keep legacy localStorage keys for components that still read them directly
  localStorage.setItem('lenscape_user_token', data.token)
  localStorage.setItem('lenscape_user_id', data.userId)
  localStorage.setItem('lenscape_user_name', data.name || '')
  localStorage.setItem('lenscape_user_email', data.email)
  localStorage.setItem('lenscape_profile_complete', data.profileComplete ? 'true' : 'false')
  if (data.college) localStorage.setItem('lenscape_user_college', data.college)
  if (data.branch)  localStorage.setItem('lenscape_user_branch', data.branch)
  if (data.bio)     localStorage.setItem('lenscape_user_bio', data.bio)
  if (data.avatar)  localStorage.setItem('lenscape_user_avatar', data.avatar)
}

export function getToken(): string | null {
  // Zustand persisted store is the source of truth
  const storeUser = useAuthStore.getState().user
  if (storeUser?.token) return storeUser.token
  // Fallback to legacy key (e.g. if store hasn't hydrated yet)
  return localStorage.getItem('lenscape_user_token')
}

export function clearSession() {
  useAuthStore.getState().clearUser()

  localStorage.removeItem('lenscape_user_token')
  localStorage.removeItem('lenscape_user_id')
  localStorage.removeItem('lenscape_user_name')
  localStorage.removeItem('lenscape_user_email')
  localStorage.removeItem('lenscape_profile_complete')
  localStorage.removeItem('lenscape_user_college')
  localStorage.removeItem('lenscape_user_branch')
  localStorage.removeItem('lenscape_user_bio')
  localStorage.removeItem('lenscape_user_avatar')
  localStorage.removeItem('lenscape-auth')
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function verifySession(): Promise<SessionData | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok || !data.valid) {
      if (res.status === 401 || res.status === 403) clearSession()
      return null
    }
    return { token, userId: data.userId, name: data.name, email: data.email, profileComplete: data.profileComplete }
  } catch {
    // Network error — don't clear, return what we have
    const u = useAuthStore.getState().user
    if (u?.token) return { token: u.token, userId: u.userId, name: u.name, email: u.email, profileComplete: u.profileComplete }
    return null
  }
}
