import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authHeaders, verifySession, saveSession, syncUserProfile, getToken } from '../lib/session'
import ParticleField from '../components/ParticleField'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState('1st Year')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=cyber')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const avatarSeeds = ['pixel', 'glitch', 'neon', 'matrix', 'terminal', 'cyber']

// ProfileSetupPage — check auth purely from localStorage, no backend roundtrip needed
  useEffect(() => {
    const token = getToken()
    if (!token) { navigate('/auth/login'); return }
    const profileComplete = localStorage.getItem('lenscape_profile_complete')
    if (profileComplete === 'true') { navigate('/profile'); return }
    const storedName = localStorage.getItem('lenscape_user_name')
    if (storedName) setName(storedName)
    setChecking(false)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !college || !branch) { setError('Name, college and branch are required'); return }
    
    // Auto-format JEC to full name
    const finalCollege = college.trim().toLowerCase() === 'jec' 
      ? 'Jabalpur Engineering College' 
      : college.trim();

    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/complete-profile`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, college: finalCollege, branch, year, bio, avatar }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save profile'); setLoading(false); return }
      saveSession({
        token: data.token,
        userId: localStorage.getItem('lenscape_user_id') || '',
        name,
        email: localStorage.getItem('lenscape_user_email') || '',
        profileComplete: true,
        college: finalCollege,
        branch,
        bio,
        avatar,
      })
      syncUserProfile()
      navigate('/profile')
    } catch {
      setError('Cannot reach server.')
    }
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-exhibition-void flex items-center justify-center">
        <span className="font-mono text-xs text-exhibition-gold animate-pulse uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone relative overflow-hidden py-16 px-4 flex items-center justify-center select-none">
      <ParticleField color="rgba(201, 168, 76, 0.2)" count={70} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full z-10">
        <div className="bg-[#0c0c0c] border border-exhibition-gold/25 p-8 md:p-10 shadow-2xl relative">
          {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(p => (
            <div key={p} className={`absolute ${p} w-1.5 h-1.5 bg-exhibition-gold/30 rounded-full`} />
          ))}

          <div className="text-center mb-8">
            <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Almost There</span>
            <h2 className="editorial-text text-4xl font-light">Complete Profile</h2>
            <p className="font-mono text-[10px] text-zinc-500 mt-2">Tell us who you are to join the exhibition</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Creator Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Tanisha"
                className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">College</label>
                <input type="text" value={college} onChange={e => setCollege(e.target.value)} required placeholder="e.g. JNEC"
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50" />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Branch</label>
                <input type="text" value={branch} onChange={e => setBranch(e.target.value)} required placeholder="e.g. CS"
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Year</label>
                <select value={year} onChange={e => setYear(e.target.value)}
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50">
                  {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Bio</label>
                <input type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g. 3D Animator"
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-3">Identity Avatar</label>
              <div className="flex gap-3 justify-center flex-wrap">
                {avatarSeeds.map(seed => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
                  return (
                    <div key={seed} onClick={() => setAvatar(url)}
                      className={`w-10 h-10 border cursor-pointer relative transition-all ${avatar === url ? 'border-exhibition-gold scale-105' : 'border-zinc-800 hover:border-zinc-700'}`}>
                      <img src={url} alt={seed} className="w-full h-full object-contain" />
                      {avatar === url && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-exhibition-gold rounded-full" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Enter Exhibition'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
