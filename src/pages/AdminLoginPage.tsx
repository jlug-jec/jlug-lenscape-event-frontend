import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      localStorage.setItem('lenscape_admin_token', data.token)
      localStorage.setItem('lenscape_admin_name', data.name)
      navigate('/admin')
    } catch {
      setError('Could not reach server. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-exhibition-gold/40 mb-5">
            <ShieldCheck className="w-6 h-6 text-exhibition-gold" />
          </div>
          <span className="block font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.4em] mb-2">
            Lenscape
          </span>
          <h1 className="editorial-text text-3xl font-light text-exhibition-bone">
            Curator Login
          </h1>
          <p className="font-mono text-[10px] text-zinc-600 mt-2 uppercase tracking-wider">
            Restricted — authorised personnel only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-exhibition-gold/20 p-8 space-y-5 relative">
          {/* Corner rivets */}
          {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(pos => (
            <div key={pos} className={`absolute ${pos} w-1.5 h-1.5 bg-exhibition-gold/25 rounded-full`} />
          ))}

          {/* Email */}
          <div>
            <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@jlug.club"
              className="w-full bg-[#111] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#111] border border-zinc-800 text-xs font-mono px-4 py-3 pr-10 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-[10px] text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-exhibition-gold text-exhibition-void font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            <Lock size={12} />
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center font-mono text-[9px] text-zinc-700 mt-6 uppercase tracking-widest">
          New admin? <Link to="/admin/signup" className="text-exhibition-gold hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  )
}
