import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Users, UploadCloud, CheckCircle, Ban, TrendingUp, LogOut, Eye, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders() {
  const token = localStorage.getItem('lenscape_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [adminName, setAdminName] = useState('')

  const [pendingArtworks, setPendingArtworks] = useState<any[]>([])
  const [approvedArtworks, setApprovedArtworks] = useState<any[]>([])
  const [rejectedArtworks, setRejectedArtworks] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ users: 0, totalUploads: 0, votes: 0, pending: 0, approved: 0, rejected: 0 })
  const [activeTab, setActiveTab] = useState<'moderation' | 'approved' | 'rejected' | 'users'>('moderation')
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [previewArtwork, setPreviewArtwork] = useState<any | null>(null)

  // ── Verify admin token on mount ──────────────────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('lenscape_admin_token')
      if (!token) { navigate('/admin/login'); return }
      try {
        const res = await fetch(`${API}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok || !data.valid) { navigate('/admin/login'); return }
        setAdminName(data.name || localStorage.getItem('lenscape_admin_name') || 'Curator')
      } catch {
        navigate('/admin/login')
        return
      }
      setChecking(false)
    }
    verify()
  }, [navigate])

  // ── Load data after verified ─────────────────────────────────────────────────
  useEffect(() => {
    if (checking) return
    fetchPending()
    fetchApproved()
    fetchRejected()
    fetchUsers()
  }, [checking])

  const fetchPending = async () => {
    const res = await fetch(`${API}/api/artworks/pending`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setPendingArtworks(data)
      setStats(prev => ({ ...prev, pending: data.length }))
    }
  }

  const fetchApproved = async () => {
    const res = await fetch(`${API}/api/admin/artworks`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setApprovedArtworks(data)
      // Calculate total votes from approved artworks
      const totalVotes = data.reduce((sum: number, art: any) => sum + (art.votes || 0), 0)
      setStats(prev => ({ ...prev, approved: data.length, votes: totalVotes }))
    }
  }

  const fetchRejected = async () => {
    const res = await fetch(`${API}/api/artworks/rejected`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setRejectedArtworks(data)
      setStats(prev => ({ ...prev, rejected: data.length }))
    }
  }

  const fetchUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setAllUsers(data)
      const votes = data.reduce((s: number, u: any) => s + (u.votedCategories?.length || 0), 0)
      // total uploads = sum of submissions across all users
      const totalUploads = data.reduce((s: number, u: any) => s + (u.submissions?.length || 0), 0)
      setStats(prev => ({ ...prev, users: data.length, votes, totalUploads }))
    }
  }

  const approveArtwork = async (id: string) => {
    await fetch(`${API}/api/artworks/${id}/approve`, { method: 'POST', headers: authHeaders() })
    fetchPending()
    fetchApproved()
  }

  const rejectArtwork = async (id: string) => {
    await fetch(`${API}/api/artworks/${id}/reject`, { method: 'POST', headers: authHeaders() })
    fetchPending()
    fetchRejected()
  }

  const rejectWithReason = async () => {
    if (!rejecting) return
    await fetch(`${API}/api/artworks/${rejecting}/reject`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reason: rejectReason.trim() }),
    })
    setRejecting(null)
    setRejectReason('')
    setPreviewArtwork(null)
    fetchPending()
    fetchRejected()
  }

  const banUser = async (userId: string) => {
    await fetch(`${API}/api/admin/users/${userId}/ban`, { method: 'POST', headers: authHeaders() })
    fetchUsers()
  }

  const unbanUser = async (userId: string) => {
    await fetch(`${API}/api/admin/users/${userId}/unban`, { method: 'POST', headers: authHeaders() })
    fetchUsers()
  }

  const handleLogout = () => {
    localStorage.removeItem('lenscape_admin_token')
    localStorage.removeItem('lenscape_admin_name')
    navigate('/admin/login')
  }

  // ── Export all data to XLSX ──────────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new()

    // ── Sheet 1: Users ──────────────────────────────────────────────────────
    const usersData = allUsers.map((u: any) => ({
      'Name':              u.name || '',
      'Email':             u.email || '',
      'College':           u.college || '',
      'Branch':            u.branch || '',
      'Year':              u.year || '',
      'Auth Provider':     u.authProvider || '',
      'Profile Complete':  u.profileComplete ? 'Yes' : 'No',
      'Banned':            u.isBanned ? 'Yes' : 'No',
      'Voted Categories':  (u.votedCategories || []).join(', ') || 'None',
      'Votes Cast':        (u.votedCategories || []).length,
      'Joined Date':       (() => {
                             if (!u.joinedDate) return '';
                             try {
                               const d = u.joinedDate._seconds ? new Date(u.joinedDate._seconds * 1000) : new Date(typeof u.joinedDate === 'string' ? u.joinedDate.split('.')[0] + 'Z' : u.joinedDate);
                               return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN');
                             } catch (e) { return ''; }
                           })(),
    }))
    const wsUsers = XLSX.utils.json_to_sheet(usersData)
    wsUsers['!cols'] = [20, 30, 30, 20, 10, 15, 15, 8, 40, 12, 15].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Users')

    // ── Sheet 2: All Artworks ────────────────────────────────────────────────
    const allArtworks = [...approvedArtworks, ...pendingArtworks, ...rejectedArtworks]
    const artworksData = allArtworks.map((a: any) => ({
      'Title':          a.title || '',
      'Category':       a.category || '',
      'Subcategory':    a.subcategory || '',
      'Status':         a.status || '',
      'Artist Name':    a.artist?.name || '',
      'Artist Email':   a.artist?.email || '',
      'College':        a.artist?.college || '',
      'Branch':         a.artist?.branch || '',
      'Year':           a.artist?.year || '',
      'Votes':          a.votes ?? '',
      'Has Image':      a.imageUrl ? 'Yes' : 'No',
      'Image URL':      a.imageUrl || '',
      'Has Video':      a.videoUrl ? 'Yes' : 'No',
      'Video URL':      a.videoUrl || '',
      'Rejection Note': a.rejectionReason || '',
      'Submitted':      (() => {
                          if (!a.createdAt) return '';
                          try {
                            const d = a.createdAt._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(typeof a.createdAt === 'string' ? a.createdAt.split('.')[0] + 'Z' : a.createdAt);
                            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN');
                          } catch (e) { return ''; }
                        })(),
    }))
    const wsArtworks = XLSX.utils.json_to_sheet(artworksData)
    wsArtworks['!cols'] = [30, 16, 18, 10, 25, 30, 25, 20, 8, 8, 10, 50, 10, 50, 30, 15].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, wsArtworks, 'Artworks')

    // ── Sheet 3: Votes Summary (per category) ────────────────────────────────
    const categories = ['photography', 'digital-art', 'cinematography', 'motion-graphics']
    const votesData = categories.map(cat => {
      const catArtworks = approvedArtworks.filter((a: any) => a.category === cat)
      const sorted = [...catArtworks].sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
      return {
        'Category':       cat,
        'Total Artworks': catArtworks.length,
        'Total Votes':    catArtworks.reduce((s: number, a: any) => s + (a.votes || 0), 0),
        'Leader':         sorted[0]?.title || 'N/A',
        'Leader Votes':   sorted[0]?.votes ?? 'N/A',
        'Leader Artist':  sorted[0]?.artist?.name || 'N/A',
        '2nd Place':      sorted[1]?.title || 'N/A',
        '2nd Votes':      sorted[1]?.votes ?? 'N/A',
        '3rd Place':      sorted[2]?.title || 'N/A',
        '3rd Votes':      sorted[2]?.votes ?? 'N/A',
      }
    })
    const wsVotes = XLSX.utils.json_to_sheet(votesData)
    wsVotes['!cols'] = [20, 16, 12, 30, 12, 25, 30, 10, 30, 10].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, wsVotes, 'Votes by Category')

    // ── Sheet 4: Leaderboard (all approved artworks sorted by votes) ─────────
    const leaderboard = [...approvedArtworks]
      .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
      .map((a: any, i: number) => ({
        'Rank':     i + 1,
        'Title':    a.title || '',
        'Category': a.category || '',
        'Artist':   a.artist?.name || '',
        'College':  a.artist?.college || '',
        'Votes':    a.votes ?? 0,
      }))
    const wsLeader = XLSX.utils.json_to_sheet(leaderboard)
    wsLeader['!cols'] = [6, 30, 16, 25, 25, 8].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, wsLeader, 'Leaderboard')

    // ── Download ─────────────────────────────────────────────────────────────
    const timestamp = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `lenscape-export-${timestamp}.xlsx`)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <span className="font-mono text-xs text-exhibition-gold animate-pulse uppercase tracking-widest">
          Verifying credentials...
        </span>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-[#020202] text-exhibition-bone py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-exhibition-gold" />
            <div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                Curator Dashboard
              </span>
              <span className="font-mono text-sm text-exhibition-gold">{adminName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-exhibition-gold/40 hover:border-exhibition-gold hover:bg-exhibition-gold/10 text-exhibition-gold font-mono text-[10px] uppercase tracking-widest transition-colors"
            >
              <Download size={12} />
              Export XLSX
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 text-red-400 font-mono text-[10px] uppercase tracking-widest transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {[
            { label: 'Participants', value: stats.users, Icon: Users, color: 'text-cyan-400' },
            { label: 'Pending', value: stats.pending, Icon: UploadCloud, color: 'text-exhibition-gold' },
            { label: 'Approved', value: stats.approved, Icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Rejected', value: stats.rejected, Icon: Ban, color: 'text-red-400' },
            { label: 'Total Votes', value: stats.votes, Icon: TrendingUp, color: 'text-purple-400' },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="border border-zinc-900 bg-[#0c0c0c] p-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-[8px] text-zinc-600 block uppercase tracking-widest">{label}</span>
                <span className="editorial-text text-3xl font-bold text-exhibition-gold">{value}</span>
              </div>
              <Icon className={`w-7 h-7 ${color}`} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-900 mb-8 font-mono text-[10px] uppercase tracking-widest overflow-x-auto">
          {[
            { id: 'moderation', label: `Pending (${stats.pending})` },
            { id: 'approved', label: `Approved (${stats.approved})` },
            { id: 'rejected', label: `Rejected (${stats.rejected})` },
            { id: 'users', label: 'Users' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-6 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-exhibition-gold text-exhibition-gold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Moderation Tab (Pending) ── */}
        {activeTab === 'moderation' && (
          <div className="space-y-5">
            {pendingArtworks.map(art => (
              <div key={art.id} className="border border-zinc-900 bg-[#0c0c0c] p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
                <div className="flex gap-4 items-center">
                  <img src={art.thumbnailUrl || art.imageUrl} className="w-16 h-16 object-cover border border-zinc-800" alt="" />
                  <div>
                    <h4 className="font-mono text-sm font-bold text-exhibition-bone">{art.title}</h4>
                    <p className="font-mono text-[10px] text-zinc-500">by {art.artist?.name} · {art.artist?.college}</p>
                    <span className="font-mono text-[8px] text-exhibition-gold uppercase tracking-widest">{art.category}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPreviewArtwork(art)}
                    className="px-4 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-exhibition-gold/50 hover:text-exhibition-gold transition-colors flex items-center gap-1.5">
                    <Eye size={12} /> View
                  </button>
                  <button onClick={() => approveArtwork(art.id)}
                    className="px-5 py-2 bg-exhibition-gold text-exhibition-void font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors">
                    Approve
                  </button>
                  <button onClick={() => setRejecting(art.id)}
                    className="px-5 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-red-500/50 hover:text-red-400 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingArtworks.length === 0 && (
              <div className="text-center py-20 border border-zinc-900">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">No pending submissions.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Approved Tab ── */}
        {activeTab === 'approved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approvedArtworks.map(art => (
              <div key={art.id} className="border border-zinc-900 bg-[#0c0c0c] overflow-hidden group cursor-pointer hover:border-exhibition-gold/40 transition-colors"
                onClick={() => setPreviewArtwork(art)}>
                <div className="aspect-[4/3] overflow-hidden relative bg-black">
                  {art.thumbnailUrl || art.imageUrl ? (
                    <img src={art.thumbnailUrl || art.imageUrl} alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-mono text-sm font-bold text-exhibition-bone truncate mb-1">{art.title}</h4>
                  <p className="font-mono text-[10px] text-zinc-500 mb-2">by {art.artist?.name}</p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                    <span className="text-exhibition-gold uppercase">{art.category.replace('-', ' ')}</span>
                    <span>{art.votes || 0} votes</span>
                  </div>
                  {art.approvedBy && (
                    <div className="pt-2 border-t border-chic-muted/20 text-[8px] text-zinc-500 uppercase tracking-widest">
                      Approved by: <span className="text-exhibition-gold">{art.approvedBy}</span>
                    </div>
                  )}
                  {art.voterDetails && art.voterDetails.length > 0 && (
                    <div className="pt-2 border-t border-chic-muted/20">
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Liked by:</p>
                      <div className="flex flex-wrap gap-1">
                        {art.voterDetails.slice(0, 3).map((voter: any) => (
                          <span key={voter.id} className="text-[7px] bg-exhibition-gold/10 text-exhibition-gold px-2 py-0.5 border border-exhibition-gold/20">
                            {voter.name}
                          </span>
                        ))}
                        {art.voterDetails.length > 3 && (
                          <span className="text-[7px] text-zinc-500 px-2 py-0.5">+{art.voterDetails.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {approvedArtworks.length === 0 && (
              <div className="col-span-full text-center py-20 border border-zinc-900">
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">No approved artworks yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Rejected Tab ── */}
        {activeTab === 'rejected' && (
          <div className="space-y-5">
            {rejectedArtworks.map(art => (
              <div key={art.id} className="border border-red-900/30 bg-[#0c0c0c] p-5 flex flex-col md:flex-row gap-5 justify-between items-start">
                <div className="flex gap-4 items-center flex-1">
                  <img src={art.thumbnailUrl || art.imageUrl} className="w-16 h-16 object-cover border border-zinc-800 opacity-60" alt="" />
                  <div className="flex-1">
                    <h4 className="font-mono text-sm font-bold text-zinc-400">{art.title}</h4>
                    <p className="font-mono text-[10px] text-zinc-600">by {art.artist?.name} · {art.artist?.college}</p>
                    <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">{art.category}</span>
                    {art.rejectionReason && (
                      <p className="mt-2 font-mono text-[9px] text-red-400/70 bg-red-500/5 border border-red-500/15 px-3 py-2">
                        Reason: {art.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setPreviewArtwork(art)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-exhibition-gold/50 hover:text-exhibition-gold transition-colors flex items-center gap-1.5">
                  <Eye size={12} /> View
                </button>
              </div>
            ))}
            {rejectedArtworks.length === 0 && (
              <div className="text-center py-20 border border-zinc-900">
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">No rejected submissions.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto border border-zinc-900">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-900 text-[9px] text-zinc-600 uppercase tracking-widest">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Votes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} className="border-b border-zinc-900/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-exhibition-bone">{u.name}</div>
                      <div className="text-[9px] text-zinc-600">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{u.college}</td>
                    <td className="py-3 px-4 text-exhibition-gold">{u.votedCategories?.length || 0}</td>
                    <td className="py-3 px-4">
                      {u.isBanned
                        ? <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 uppercase">Banned</span>
                        : <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 uppercase">Active</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.isBanned
                        ? <button onClick={() => unbanUser(u.id)} className="text-[9px] text-exhibition-gold hover:underline uppercase">Restore</button>
                        : <button onClick={() => banUser(u.id)} className="flex items-center gap-1 text-[9px] text-red-400/70 hover:text-red-400 uppercase ml-auto">
                            <Ban size={10} /> Ban
                          </button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>

      {/* ── Artwork Preview Modal ── */}
      <AnimatePresence>
        {previewArtwork && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-5xl max-h-[90vh] md:h-[80vh] bg-[#0d0d0d] border border-exhibition-gold/30 shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={() => setPreviewArtwork(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 border border-exhibition-gold/20 flex items-center justify-center hover:bg-exhibition-gold hover:text-exhibition-void text-exhibition-gold transition-colors font-mono text-lg">
                ×
              </button>

              {/* Image / Video */}
              <div className="w-full md:w-[65%] h-64 sm:h-80 md:h-full flex-shrink-0 bg-black flex items-center justify-center relative p-6 border-b md:border-b-0 md:border-r border-zinc-900">
                <div className="absolute top-0 w-32 h-32 bg-exhibition-gold/10 blur-xl rounded-full" />
                {previewArtwork.videoUrl ? (
                  <iframe src={previewArtwork.videoUrl} title={previewArtwork.title}
                    className="w-full aspect-video bg-black border border-zinc-800"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                ) : previewArtwork.imageUrl ? (
                  <img src={previewArtwork.imageUrl} alt={previewArtwork.title}
                    className="max-w-full max-h-full object-contain shadow-2xl border border-white/5" />
                ) : (
                  <div className="text-zinc-500 font-mono text-sm">Image Unavailable</div>
                )}
              </div>

              {/* Details */}
              <div className="w-full md:w-[35%] flex flex-col bg-[#0b0b0b] flex-grow">
                <div className="p-6 border-b border-zinc-900 flex-1">
                  <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.25em] block mb-1">
                    {previewArtwork.category?.replace('-', ' ')}
                    {previewArtwork.subcategory && ` · ${previewArtwork.subcategory}`}
                  </span>
                  <h3 className="editorial-text text-2xl md:text-3xl font-light text-exhibition-bone mt-1">
                    {previewArtwork.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-2 uppercase tracking-wide">
                    By {previewArtwork.artist?.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">{previewArtwork.artist?.college}</p>
                  {previewArtwork.artist?.branch && (
                    <p className="text-[10px] text-zinc-600 font-mono">{previewArtwork.artist.branch} · {previewArtwork.artist.year}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-4 font-mono font-light leading-relaxed max-h-32 overflow-y-auto pr-1">
                    {previewArtwork.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                    <span className="text-zinc-500 text-xs font-mono">{previewArtwork.votes || 0} votes</span>
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${
                      previewArtwork.status === 'approved' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                      : previewArtwork.status === 'rejected' ? 'text-red-400 border-red-500/20 bg-red-500/5'
                      : 'text-exhibition-gold border-exhibition-gold/20 bg-exhibition-gold/5'
                    }`}>{previewArtwork.status}</span>
                  </div>

                  {previewArtwork.approvedBy && (
                    <div className="mt-3 pt-3 border-t border-chic-muted/20 text-[9px] font-mono text-zinc-500">
                      Approved by: <span className="text-exhibition-gold font-bold">{previewArtwork.approvedBy}</span>
                    </div>
                  )}

                  {previewArtwork.voterDetails && previewArtwork.voterDetails.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-chic-muted/20">
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Liked by ({previewArtwork.voterDetails.length}):</p>
                      <div className="space-y-1.5">
                        {previewArtwork.voterDetails.map((voter: any) => (
                          <div key={voter.id} className="text-[8px] font-mono bg-exhibition-gold/5 border border-exhibition-gold/15 px-3 py-1.5 rounded">
                            <div className="text-exhibition-gold font-bold">{voter.name}</div>
                            <div className="text-zinc-500">{voter.college || voter.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin quick actions inside modal */}
                {previewArtwork.status === 'pending' && (
                  <div className="p-4 border-t border-zinc-900 flex gap-3 bg-black/40">
                    <button onClick={() => { approveArtwork(previewArtwork.id); setPreviewArtwork(null) }}
                      className="flex-1 py-2.5 bg-exhibition-gold text-exhibition-void font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors">
                      Approve
                    </button>
                    <button onClick={() => setRejecting(previewArtwork.id)}
                      className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-red-500/50 hover:text-red-400 transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rejection Reason Dialog ── */}
      <AnimatePresence>
        {rejecting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setRejecting(null); setRejectReason('') }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0d0d0d] border border-red-500/30 p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="editorial-text text-2xl font-light text-exhibition-bone mb-2">Reject Submission</h3>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-6">
                Optionally write a reason — it will be shown to the participant.
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
                placeholder="e.g. Image quality too low, does not meet exhibition standards..."
                className="w-full bg-[#111] border border-zinc-800 text-xs font-sans px-4 py-3 text-exhibition-bone focus:outline-none focus:border-red-500/50 resize-none mb-5"
              />
              <div className="flex gap-3">
                <button onClick={() => { setRejecting(null); setRejectReason('') }}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-zinc-500 transition-colors">
                  Cancel
                </button>
                <button onClick={rejectWithReason}
                  className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-red-500/30 transition-colors">
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
