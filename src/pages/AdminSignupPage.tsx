import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleField from '../components/ParticleField'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

type Step = 'form' | 'done'

export default function AdminSignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const routeAfterAuth = () => {
    setStep('done')
    setTimeout(() => navigate('/admin'), 900)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (!secretKey.trim()) { setError('Secret key is required'); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, secretKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      localStorage.setItem('lenscape_admin_token', data.token)
      localStorage.setItem('lenscape_admin_name', data.name)
      routeAfterAuth()
    } catch {
      setError('Cannot reach server.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone relative overflow-hidden py-16 px-4 flex items-center justify-center select-none">
      <ParticleField color="rgba(201, 168, 76, 0.2)" count={70} />

      <div className="max-w-md w-full z-10">
        <Link to="/admin/login">
          <button className="flex items-center gap-2 text-chic-muted hover:text-exhibition-gold transition-colors mb-8 font-mono text-xs uppercase tracking-widest bg-transparent border-0 cursor-pointer">
            <ArrowLeft size={14} /> Back to Login
          </button>
        </Link>

        <AnimatePresence mode="wait">

          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-chic-light/20 border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(p => (
                  <div key={p} className={`absolute ${p} w-1.5 h-1.5 bg-exhibition-gold/30 rounded-full`} />
                ))}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 border border-exhibition-gold/40 mb-4">
                    <ShieldCheck className="w-5 h-5 text-exhibition-gold" />
                  </div>
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Curator</span>
                  <h2 className="editorial-text text-4xl font-light">Register Admin</h2>
                  <p className="font-mono text-[10px] text-chic-muted mt-2">Create your curator account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block font-mono text-[9px] text-chic-muted uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#111] border border-exhibition-gold/30 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/60 placeholder:text-zinc-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-mono text-[9px] text-chic-muted uppercase tracking-widest mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@jlug.club"
                      className="w-full bg-[#111] border border-exhibition-gold/30 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/60 placeholder:text-zinc-700"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-mono text-[9px] text-chic-muted uppercase tracking-widest mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#111] border border-exhibition-gold/30 text-xs font-mono px-4 py-3 pr-10 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/60 placeholder:text-zinc-700"
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-exhibition-gold">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div>
                    <label className="block font-mono text-[9px] text-chic-muted uppercase tracking-widest mb-2">
                      Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={secretKey}
                        onChange={e => setSecretKey(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#111] border border-exhibition-gold/30 text-xs font-mono px-4 py-3 pr-10 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/60 placeholder:text-zinc-700"
                      />
                      <button type="button" onClick={() => setShowSecret(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-exhibition-gold">
                        {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="font-mono text-[8px] text-zinc-600 mt-1">Provided by gallery administrator</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                      className="font-mono text-[10px] text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-2">
                      {error}
                    </motion.p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-exhibition-gold text-exhibition-void font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    <Lock size={12} />
                    {loading ? 'Creating Account...' : 'Create Curator Account'}
                  </button>
                </form>

                <p className="text-center font-mono text-[9px] text-zinc-700 mt-6 uppercase tracking-widest">
                  Already registered? <Link to="/admin/login" className="text-exhibition-gold hover:underline">Sign in</Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-exhibition-gold/10 border border-exhibition-gold/30 mb-6"
                >
                  <CheckCircle className="w-8 h-8 text-exhibition-gold" />
                </motion.div>
                <h3 className="editorial-text text-3xl font-light mb-3">Welcome, Curator</h3>
                <p className="font-mono text-[10px] text-chic-muted uppercase tracking-wider">
                  Redirecting to dashboard...
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
