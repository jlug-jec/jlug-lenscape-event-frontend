import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { saveSession } from '../lib/session'
import ParticleField from '../components/ParticleField'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AuthLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const routeAfterAuth = (profileComplete: boolean) => {
    setDone(true)
    setTimeout(() => navigate(profileComplete ? '/profile' : '/profile/setup'), 900)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Google sign-in failed'); setLoading(false); return }
      saveSession(data)
      routeAfterAuth(data.profileComplete)
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') setError('Sign-in cancelled.')
      else setError('Google sign-in failed. Try again.')
    }
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      saveSession(data)
      routeAfterAuth(data.profileComplete)
    } catch {
      setError('Cannot reach server.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone relative overflow-hidden py-16 px-4 flex items-center justify-center select-none">
      <ParticleField color="rgba(201, 168, 76, 0.2)" count={70} />

      <div className="max-w-md w-full z-10">
        <Link to="/">
          <button className="flex items-center gap-2 text-zinc-500 hover:text-exhibition-gold transition-colors mb-8 font-mono text-xs uppercase tracking-widest bg-transparent border-0 cursor-pointer">
            <ArrowLeft size={14} /> Exhibition Hall
          </button>
        </Link>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-16 h-16 border border-exhibition-gold/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-exhibition-gold" />
              </div>
              <h2 className="editorial-text text-3xl font-light mb-2">Verified</h2>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Redirecting...</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(p => (
                  <div key={p} className={`absolute ${p} w-1.5 h-1.5 bg-exhibition-gold/30 rounded-full`} />
                ))}

                <div className="text-center mb-8">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Credentials Registry</span>
                  <h2 className="editorial-text text-4xl font-light">Welcome Back</h2>
                </div>

                {/* Google */}
                <button onClick={handleGoogle} disabled={loading} type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 mb-5">
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.4 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="font-mono text-[9px] text-zinc-600 uppercase">or</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@college.edu"
                      className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono pl-9 pr-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700" />
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="password"
                      className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono pl-9 pr-10 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Log In'}
                  </button>
                </form>

                <p className="text-center font-mono text-[10px] text-zinc-500 mt-5">
                  No account?{' '}
                  <Link to="/auth/signup" className="text-exhibition-gold hover:underline">Create one</Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
