import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { saveSession } from '../lib/session'
import ParticleField from '../components/ParticleField'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Rivet corners — static, defined outside so it never causes remount ──────
const RIVET_POSITIONS = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2']

const Rivets = () => (
  <>
    {RIVET_POSITIONS.map(p => (
      <div key={p} className={`absolute ${p} w-1.5 h-1.5 bg-exhibition-gold/30 rounded-full`} />
    ))}
  </>
)

// ── Google SVG logo ──────────────────────────────────────────────────────────
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.4 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
)

// ── Divider ──────────────────────────────────────────────────────────────────
const Divider = ({ label = 'or' }: { label?: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-zinc-800" />
    <span className="font-mono text-[9px] text-zinc-600 uppercase">{label}</span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
)

type Step = 'choose' | 'login' | 'signup' | 'otp' | 'done'

export default function AuthPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpToken, setOtpToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const routeAfterAuth = (profileComplete: boolean) => {
    setStep('done')
    setTimeout(() => navigate(profileComplete ? '/profile' : '/profile/setup'), 1000)
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send code'); setLoading(false); return }
      setOtpToken(data.token)
      setStep('otp')
      setResendCooldown(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 150)
    } catch {
      setError('Cannot reach server.')
    }
    setLoading(false)
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const d = [...otpDigits]
    d[i] = val.slice(-1)
    setOtpDigits(d)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length === 6) { setOtpDigits(p.split('')); otpRefs.current[5]?.focus() }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = otpDigits.join('')
    if (otp.length < 6) { setError('Enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, token: otpToken }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Verification failed'); setLoading(false); return }
      saveSession(data)
      routeAfterAuth(false)
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

          {step === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                <Rivets />
                <div className="text-center mb-8">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Credentials Registry</span>
                  <h2 className="editorial-text text-4xl font-light">Enter Exhibition</h2>
                  <p className="font-mono text-[10px] text-zinc-500 mt-2">Sign in to vote, comment and submit art</p>
                </div>
                <div className="space-y-4">
                  <button onClick={handleGoogle} disabled={loading} type="button"
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    <GoogleLogo /> Continue with Google
                  </button>
                  <Divider />
                  <button onClick={() => { setStep('login'); setError('') }}
                    className="w-full py-3.5 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    Continue with Email
                  </button>
                  {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">{error}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                <Rivets />
                <div className="text-center mb-8">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Login</span>
                  <h2 className="editorial-text text-4xl font-light">Welcome Back</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="mt-5 flex items-center justify-between font-mono text-[10px]">
                  <button onClick={() => { setStep('choose'); setError('') }} className="text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider">← Back</button>
                  <button onClick={() => { setStep('signup'); setError('') }} className="text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider">Create account →</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'signup' && (
            <motion.div key="signup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                <Rivets />
                <div className="text-center mb-8">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Register</span>
                  <h2 className="editorial-text text-4xl font-light">Create Account</h2>
                  <p className="font-mono text-[10px] text-zinc-500 mt-2">We'll email a code to verify it's really you</p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@college.edu"
                      className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono pl-9 pr-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700" />
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="choose a password (min 6 chars)"
                      className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono pl-9 pr-10 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 placeholder:text-zinc-700" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                    {loading ? 'Sending code...' : 'Send verification code'}
                  </button>
                </form>
                <div className="mt-5 flex items-center justify-between font-mono text-[10px]">
                  <button onClick={() => { setStep('choose'); setError('') }} className="text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider">← Back</button>
                  <button onClick={() => { setStep('login'); setError('') }} className="text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider">Have an account? Log in</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
                <Rivets />
                <div className="text-center mb-8">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Verification</span>
                  <h2 className="editorial-text text-4xl font-light">Enter Code</h2>
                  <p className="font-mono text-[10px] text-zinc-500 mt-2">6-digit code sent to <span className="text-exhibition-gold">{email}</span></p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
                        value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                        className="w-11 h-14 text-center text-xl font-mono font-bold bg-[#121212] border border-zinc-800 text-exhibition-bone focus:outline-none focus:border-exhibition-gold transition-colors caret-exhibition-gold" />
                    ))}
                  </div>
                  {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2 text-center">{error}</p>}
                  <button type="submit" disabled={loading || otpDigits.join('').length < 6}
                    className="w-full py-4 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <button type="button" onClick={() => { setStep('signup'); setOtpDigits(['','','','','','']); setError('') }}
                      className="text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider">← Change details</button>
                    <button type="button" onClick={() => handleSendOtp()} disabled={resendCooldown > 0}
                      className="flex items-center gap-1 text-zinc-500 hover:text-exhibition-gold uppercase tracking-wider disabled:opacity-40">
                      <RefreshCw size={10} />{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-16 h-16 border border-exhibition-gold/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-exhibition-gold" />
              </div>
              <h2 className="editorial-text text-3xl font-light mb-2">Verified</h2>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Redirecting...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}