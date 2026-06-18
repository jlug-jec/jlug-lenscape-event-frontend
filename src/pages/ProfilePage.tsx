import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, School, BookOpen, User, Award, Compass, Rocket, MessageSquare, Crown, Gem, Clock, CheckCircle, XCircle, Star, Medal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clearSession, getToken, authHeaders, syncUserProfile } from '../lib/session'
import { useAuthStore } from '../store/authStore'
import ExhibitionNav from '../components/ExhibitionNav'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface Artwork {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  imageUrl: string | null
  thumbnailUrl: string | null
  videoUrl?: string | null
  votes: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: any
  comments?: any[]
  rejectionReason?: string
  artist?: { name: string; college: string; branch?: string; year?: string }
}

const STATUS_CONFIG = {
  approved: { label: 'Approved', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', Icon: CheckCircle },
  pending:  { label: 'In Review', color: 'text-exhibition-gold border-exhibition-gold/20 bg-exhibition-gold/5', Icon: Clock },
  rejected: { label: 'Rejected',  color: 'text-red-400 border-red-500/20 bg-red-500/5', Icon: XCircle },
}

function formatDate(raw: any): string {
  if (!raw) return '—'
  let ms: number
  if (typeof raw === 'object' && raw._seconds) {
    // Firestore Timestamp object: { _seconds, _nanoseconds }
    ms = raw._seconds * 1000
  } else if (raw instanceof Date) {
    // Already a JS Date object
    ms = raw.getTime()
  } else if (typeof raw === 'string' || typeof raw === 'number') {
    ms = new Date(raw).getTime()
  } else {
    ms = NaN
  }
  return isNaN(ms) ? '—' : new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const token         = getToken()
  const userName      = localStorage.getItem('lenscape_user_name') || ''
  const userEmail     = localStorage.getItem('lenscape_user_email') || ''
  const profileComplete = localStorage.getItem('lenscape_profile_complete') === 'true'
  const college       = localStorage.getItem('lenscape_user_college') || ''
  const branch        = localStorage.getItem('lenscape_user_branch') || ''
  const year          = localStorage.getItem('lenscape_user_year') || ''
  const bio           = localStorage.getItem('lenscape_user_bio') || ''
  const avatar        = localStorage.getItem('lenscape_user_avatar') || `https://api.dicebear.com/7.x/bottts/svg?seed=${userEmail}`

  const [submissions, setSubmissions]       = useState<Artwork[]>([])
  const [loadingSubmissions, setLoading]    = useState(true)
  const [activeTab, setActiveTab]           = useState<'submissions' | 'votes'>('submissions')
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    if (!token) { navigate('/auth/login'); return }
    if (!profileComplete) { navigate('/profile/setup'); return }
  }, [token, profileComplete, navigate])

  useEffect(() => {
    if (!token) return
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${API}/api/users/submissions`, { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setSubmissions(Array.isArray(data) ? data : [])
        }
      } catch {}
      setLoading(false)
    }
    fetchSubmissions()
    // Trigger a background sync of the user profile so data is always fresh
    syncUserProfile()
  }, [token])

  const handleLogout = () => { clearSession(); navigate('/') }

  if (!token || !profileComplete) {
    return (
      <div className="min-h-screen bg-exhibition-void flex items-center justify-center">
        <span className="font-mono text-xs text-exhibition-gold animate-pulse uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  const approved = submissions.filter(s => s.status === 'approved')
  const pending  = submissions.filter(s => s.status === 'pending')

  return (
    <>
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone pb-32">
      <ExhibitionNav />

      {/* Header */}
      <div className="relative border-b border-zinc-900/60 bg-black/10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-12 mb-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-32 h-32 bg-[#0c0c0c] border border-exhibition-gold p-2 relative flex-shrink-0 shadow-2xl">
                <img src={avatar} className="w-full h-full object-cover" alt={userName} />
                <div className="absolute -bottom-2 -right-2 bg-exhibition-gold text-exhibition-void px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase">Active</div>
              </div>
              <div>
                <span className="font-mono text-[10px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Registered Student Artist</span>
                <h1 className="editorial-text text-5xl md:text-7xl font-light text-exhibition-bone tracking-wide leading-none">{userName}</h1>
                <p className="text-xs font-mono text-zinc-500 mt-3 max-w-xl italic">
                  {bio ? `"${bio}"` : `"Exploring new visual dimensions in Lenscape."`}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="px-5 py-2.5 border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-mono uppercase tracking-widest transition-colors flex-shrink-0">
              Exit Terminal
            </button>
          </div>
          
          {/* User Info Placard */}
          <div className="border border-zinc-900/50 bg-[#0a0a0a] p-6 w-full mt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900/50">
              <div className="flex flex-col gap-2 p-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <School size={12} className="text-exhibition-gold" />
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Institution</span>
                </div>
                {loadingSubmissions ? (
                  <div className="h-3.5 w-24 bg-zinc-800/80 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-exhibition-bone">{user?.college || college || 'Not specified'}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 p-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-exhibition-gold" />
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Discipline</span>
                </div>
                {loadingSubmissions ? (
                  <div className="h-3.5 w-20 bg-zinc-800/80 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-exhibition-bone">{user?.branch || branch || 'Not specified'}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 p-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <Award size={12} className="text-exhibition-gold" />
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Year</span>
                </div>
                {loadingSubmissions ? (
                  <div className="h-3.5 w-16 bg-zinc-800/80 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-exhibition-bone">{(user as any)?.year || year || 'Not specified'}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 p-4 bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <User size={12} className="text-exhibition-gold" />
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Email</span>
                </div>
                {loadingSubmissions ? (
                  <div className="h-3.5 w-32 bg-zinc-800/80 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] font-mono text-exhibition-bone break-all">{userEmail}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 mb-12">
          {[
            { label: 'Submitted', value: submissions.length },
            { label: 'Approved',  value: approved.length },
            { label: 'In Review', value: pending.length },
          ].map(s => (
            <div key={s.label} className="bg-exhibition-void py-6 text-center flex flex-col items-center justify-center">
              {loadingSubmissions ? (
                <div className="h-10 w-12 bg-zinc-800/80 animate-pulse rounded mb-1" />
              ) : (
                <span className="editorial-text text-4xl font-bold text-exhibition-gold">{s.value}</span>
              )}
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-900 mb-8 font-mono text-[10px] uppercase tracking-[0.25em]">
          <button onClick={() => setActiveTab('submissions')}
            className={`py-3 px-6 border-b-2 transition-all ${activeTab === 'submissions' ? 'border-exhibition-gold text-exhibition-gold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            My Submissions ({submissions.length})
          </button>
        </div>

        {/* ── Submissions ── */}
        {activeTab === 'submissions' && (
          <div>
            {loadingSubmissions ? (
              <div className="text-center py-20 border border-zinc-900">
                <span className="font-mono text-xs text-exhibition-gold animate-pulse uppercase tracking-widest">Loading...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-20 border border-zinc-900 bg-black/10">
                <Compass className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-6">No artworks submitted yet</p>
                <Link to="/submit">
                  <button className="px-6 py-2.5 bg-exhibition-gold text-exhibition-void font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors">
                    Submit Your Artwork
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map(art => {
                  const cfg = STATUS_CONFIG[art.status]
                  return (
                    <div key={art.id}
                      onClick={() => setSelectedArtwork(art)}
                      className="border border-zinc-900 bg-[#0d0d0d] flex flex-col group cursor-pointer hover:border-exhibition-gold/40 transition-colors">
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden relative bg-black">
                        {art.thumbnailUrl || art.imageUrl ? (
                          <img src={art.thumbnailUrl || art.imageUrl || ''} alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs">No Image</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="editorial-text text-lg font-bold text-exhibition-bone truncate mb-1">{art.title}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[8px] text-exhibition-gold uppercase tracking-widest">{art.category.replace('-', ' ')}</span>
                          {art.subcategory && <>
                            <span className="text-zinc-700">·</span>
                            <span className="font-mono text-[8px] text-zinc-500 uppercase">{art.subcategory}</span>
                          </>}
                        </div>

                        {/* Date + votes/status row */}
                        <div className="mt-auto flex justify-between items-center pt-3 border-t border-zinc-900 font-mono text-[9px]">
                          <span className="text-zinc-500">{formatDate(art.createdAt) === '—' ? 'Date Unknown' : formatDate(art.createdAt)}</span>
                          <div className="flex items-center gap-1.5">
                            {/* Status badge on all screens */}
                            <span className={`flex items-center gap-1 border px-2 py-0.5 text-[8px] uppercase tracking-wider ${cfg.color}`}>
                              <cfg.Icon size={9} />
                              {cfg.label}
                            </span>
                          </div>
                        </div>

                        {art.status === 'rejected' && (
                          <p className="mt-2 font-mono text-[9px] text-red-400/70 bg-red-500/5 border border-red-500/15 px-3 py-2">
                            Not selected.{art.rejectionReason && <span className="block mt-0.5 text-zinc-500">Reason: {art.rejectionReason}</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {submissions.length > 0 && (
              <div className="mt-10 text-center">
                <Link to="/submit">
                  <button className="px-8 py-3 bg-exhibition-gold text-exhibition-void font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors">
                    Submit Another Artwork
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {/* ── Artwork Detail Modal ── */}
    <AnimatePresence>
      {selectedArtwork && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-5xl max-h-[90vh] md:h-[80vh] bg-[#0d0d0d] border border-exhibition-gold/30 shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 border border-exhibition-gold/20 flex items-center justify-center hover:bg-exhibition-gold hover:text-exhibition-void text-exhibition-gold transition-colors font-mono text-lg">
              ×
            </button>

            {/* Left: image */}
            <div className="w-full md:w-[65%] h-64 sm:h-80 md:h-full flex-shrink-0 bg-black flex items-center justify-center relative p-6 border-b md:border-b-0 md:border-r border-zinc-900">
              <div className="absolute top-0 w-32 h-32 bg-exhibition-gold/10 blur-xl rounded-full" />
              {selectedArtwork.imageUrl ? (
                <img src={selectedArtwork.imageUrl} alt={selectedArtwork.title}
                  className="max-w-full max-h-full object-contain shadow-2xl border border-white/5" />
              ) : (
                <div className="text-zinc-500 font-mono text-sm">Image Unavailable</div>
              )}
            </div>

            {/* Right: details */}
            <div className="w-full md:w-[35%] flex flex-col bg-[#0b0b0b] flex-grow overflow-y-auto">
              <div className="p-6 flex-1">
                {/* Status badge - moved above to avoid close button */}
                {(() => {
                  const cfg = STATUS_CONFIG[selectedArtwork.status]
                  return (
                    <div className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider border px-2.5 py-1 mb-4 w-fit ${cfg.color}`}>
                      <cfg.Icon size={10} />{cfg.label}
                    </div>
                  )
                })()}
                <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.25em] block mb-2">
                  {selectedArtwork.category.replace('-', ' ')}
                  {selectedArtwork.subcategory && ` · ${selectedArtwork.subcategory}`}
                </span>
                <h3 className="editorial-text text-2xl md:text-3xl font-light text-exhibition-bone mt-2">{selectedArtwork.title}</h3>
                <p className="text-xs font-mono text-zinc-400 mt-2 uppercase tracking-wide">{userName}</p>
                {college && <p className="text-[10px] text-zinc-500 font-mono">{college}</p>}
                {selectedArtwork.description && (
                  <p className="text-xs text-zinc-400 mt-4 font-mono font-light leading-relaxed">{selectedArtwork.description}</p>
                )}

                <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-xs text-zinc-500">
                  <span>{formatDate(selectedArtwork.createdAt)}</span>
                </div>

                {selectedArtwork.status === 'rejected' && selectedArtwork.rejectionReason && (
                  <div className="mt-4 font-mono text-[9px] text-red-400/70 bg-red-500/5 border border-red-500/15 px-3 py-2">
                    Rejection reason: {selectedArtwork.rejectionReason}
                  </div>
                )}

                {/* Comments - HIDDEN (kept for future use) */}
                {false && (selectedArtwork.comments?.length ?? 0) > 0 && (
                  <div className="mt-6 border-t border-zinc-900 pt-4">
                    <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                      Feedbacks ({selectedArtwork.comments!.length})
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {selectedArtwork.comments!.map((c: any) => (
                        <div key={c.id} className="text-xs font-mono bg-black/20 p-2.5 border border-zinc-900">
                          <div className="flex justify-between text-[10px] text-exhibition-gold mb-1">
                            <span>{c.userName}</span>
                            <span className="text-zinc-600">{formatDate(c.createdAt)}</span>
                          </div>
                          <p className="text-zinc-300 font-sans">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
