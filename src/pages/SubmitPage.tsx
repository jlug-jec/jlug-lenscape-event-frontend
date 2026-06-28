import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Sparkles, UploadCloud, X } from 'lucide-react'
import ExhibitionNav from '../components/ExhibitionNav'
import VideoUploader from '../components/VideoUploader'
import { authHeaders, getToken } from '../lib/session'
import { trackEvent } from '../lib/analytics'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const EVENT_CATEGORIES = [
  { id: 'photography',    label: 'Photography',    room: '01', subcategories: ['Portrait Photography', 'Landscape Photography'] },
  { id: 'digital-art',   label: 'Digital Art',    room: '02', subcategories: ['Concept Art', 'Character Design'] },
  { id: 'cinematography',label: 'Cinematography', room: '03', subcategories: ['Short Film', 'Travel Film'] },
  { id: 'motion-graphics',label: 'Motion Graphics',room: '04', subcategories: ['Logo Animation', 'Explainer Video'] },
]

// Orientation options — label, ratio string for CSS aspect-ratio, display name
const ORIENTATIONS = [
  { id: 'landscape',  label: 'Landscape',       ratio: '3/2',  css: 'aspect-[3/2]',  icon: '▬',  note: '3:2 · DSLR / Horizontal' },
  { id: 'portrait',   label: 'Portrait',        ratio: '2/3',  css: 'aspect-[2/3]',  icon: '▮',  note: '2:3 · Mobile / Vertical' },
  { id: 'square',     label: 'Square',          ratio: '1/1',  css: 'aspect-square', icon: '■',  note: '1:1 · Instagram' },
  { id: 'widescreen', label: 'Widescreen',      ratio: '16/9', css: 'aspect-video',  icon: '━',  note: '16:9 · Cinematic / Video' },
  { id: 'vertical',   label: 'Vertical Video',  ratio: '9/16', css: 'aspect-[9/16]', icon: '▌',  note: '9:16 · Reel / TikTok' },
]

export default function SubmitPage() {
  const navigate = useNavigate()
  const token = getToken()
  const profileComplete = localStorage.getItem('lenscape_profile_complete') === 'true'
  const formStartedRef = useRef(false)

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState(EVENT_CATEGORIES[0].id)
  const [subcategory, setSubcategory] = useState(EVENT_CATEGORIES[0].subcategories[0])
  const [orientation, setOrientation] = useState(ORIENTATIONS[0].id)
  const [videoUrl, setVideoUrl]       = useState('')

  // Video upload states
  const [videoFile, setVideoFile]     = useState<File | null>(null)
  const [coverFile, setCoverFile]     = useState<File | null>(null)

  const selectedCat = EVENT_CATEGORIES.find(c => c.id === category) || EVENT_CATEGORIES[0]
  const selectedOrient = ORIENTATIONS.find(o => o.id === orientation) || ORIENTATIONS[0]
  
  // Check if current category requires video upload
  const isVideoCategory = category === 'cinematography' || category === 'motion-graphics'

  const trackFormStart = (source: string, nextCategory = category) => {
    if (formStartedRef.current) return
    formStartedRef.current = true
    const nextIsVideoCategory = nextCategory === 'cinematography' || nextCategory === 'motion-graphics'
    trackEvent('artwork_form_start', {
      source,
      category: nextCategory,
      is_video_category: nextIsVideoCategory,
    })
  }

  const handleCategoryChange = (id: string) => {
    trackFormStart('category', id)
    setCategory(id)
    const cat = EVENT_CATEGORIES.find(c => c.id === id)
    if (cat) setSubcategory(cat.subcategories[0])
    // Auto-set orientation for video categories
    if (id === 'cinematography' || id === 'motion-graphics') setOrientation('widescreen')
    else setOrientation('landscape')
  }

  const [imagePreview, setImagePreview] = useState('')
  const [uploadedUrl, setUploadedUrl]   = useState('')
  const [uploading, setUploading]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    trackFormStart('cover_image')
    setError('')
    setImagePreview(URL.createObjectURL(file))
    await uploadToCloudinary(file)
  }

  const uploadToCloudinary = async (file: File) => {
    setUploading(true)
    setUploadedUrl('')
    try {
      const sigRes = await fetch(`${API}/api/cloudinary/signature`, { headers: authHeaders() })
      const sig = await sigRes.json()
      if (!sigRes.ok) { setError(sig.error || 'Could not get upload signature'); setUploading(false); return }

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', sig.api_key)
      form.append('timestamp', sig.timestamp)
      form.append('signature', sig.signature)
      form.append('folder', sig.folder)

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: form })
      const upData = await upRes.json()
      if (!upRes.ok) { setError(upData.error?.message || 'Cloudinary upload failed'); setUploading(false); return }
      setUploadedUrl(upData.secure_url)
    } catch {
      setError('Image upload failed. Check your connection.')
    }
    setUploading(false)
  }

  const clearImage = () => { setImagePreview(''); setUploadedUrl('') }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    trackEvent('artwork_submit_attempt', {
      category,
      subcategory,
      orientation,
      is_video_category: isVideoCategory,
      has_cover_image: Boolean(uploadedUrl || coverFile),
      has_video_file: Boolean(videoFile),
    })
    
    if (!title.trim() || !description.trim()) { 
      trackEvent('artwork_submit_validation_failed', {
        category,
        reason: 'missing_title_or_description',
      })
      setError('Title and description are required.'); 
      return 
    }
    
    // Check if video category requires video files
    if (isVideoCategory) {
      if (!videoFile || !coverFile) {
        trackEvent('artwork_submit_validation_failed', {
          category,
          reason: 'missing_video_or_cover',
        })
        setError('Both video file and cover image are required for video categories.')
        return
      }
      await handleVideoSubmission()
    } else {
      // Regular image submission
      if (!uploadedUrl) {
        trackEvent('artwork_submit_validation_failed', {
          category,
          reason: 'missing_cover_image',
        })
        setError('Please upload a cover image.')
        return
      }
      await handleImageSubmission()
    }
  }
  
  const handleVideoSubmission = async () => {
    setSubmitting(true)
    
    const formData = new FormData()
    formData.append('video', videoFile!)
    formData.append('cover', coverFile!)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('category', category)
    formData.append('subCategory', subcategory)
    formData.append('orientation', orientation)
    
    try {
      const res = await fetch(`${API}/api/artworks/submit-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        trackEvent('artwork_submit_failed', {
          category,
          type: 'video',
          status: res.status,
        })
        setError(data.error || 'Video submission failed')
        setSubmitting(false)
        return
      }
      
      trackEvent('artwork_submit_success', {
        category,
        type: 'video',
      })
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      trackEvent('artwork_submit_failed', {
        category,
        type: 'video',
        status: 'network',
      })
      setError('Cannot reach server. Please check your connection.')
    }
    
    setSubmitting(false)
  }
  
  const handleImageSubmission = async () => {
    setSubmitting(true)
    
    try {
      const res = await fetch(`${API}/api/artworks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim(), 
          description: description.trim(),
          category, 
          subcategory, 
          orientation,
          imageUrl: uploadedUrl || null,
          videoUrl: videoUrl.trim() || null,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) { 
        trackEvent('artwork_submit_failed', {
          category,
          type: 'image',
          status: res.status,
        })
        setError(data.error || 'Submission failed'); 
        setSubmitting(false); 
        return 
      }
      
      trackEvent('artwork_submit_success', {
        category,
        type: 'image',
      })
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch {
      trackEvent('artwork_submit_failed', {
        category,
        type: 'image',
        status: 'network',
      })
      setError('Cannot reach server.')
    }
    
    setSubmitting(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-exhibition-void text-exhibition-bone flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0d0d0d] border border-exhibition-gold/20 p-10 text-center relative">
          {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(p => (
            <div key={p} className={`absolute ${p} w-1.5 h-1.5 bg-exhibition-gold/30 rounded-full`} />
          ))}
          <AlertTriangle className="w-12 h-12 text-exhibition-gold mx-auto mb-6" />
          <h2 className="editorial-text text-3xl font-light mb-3">Curation Gate Locked</h2>
          <p className="text-xs font-mono text-zinc-500 mb-8 leading-relaxed">Please sign in to upload artworks.</p>
          <Link to="/auth/signup">
            <button className="w-full py-3 bg-exhibition-gold text-exhibition-void font-mono text-xs uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors">
              Access Gateway
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!profileComplete) { navigate('/profile/setup'); return null }

  if (success) {
    return (
      <div className="min-h-screen bg-exhibition-void text-exhibition-bone flex items-center justify-center p-6">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-exhibition-gold mx-auto mb-6" />
          <h2 className="editorial-text text-3xl font-light mb-2">Submission Received</h2>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Sent to the curation committee for review</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone pb-32">
      <ExhibitionNav />

      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-24">
        <Link to="/">
          <button className="flex items-center gap-2 text-zinc-500 hover:text-exhibition-gold transition-colors mb-8 font-mono text-xs uppercase tracking-widest bg-transparent border-0 cursor-pointer">
            <ArrowLeft size={14} /> Exhibition Hall
          </button>
        </Link>

        <div className="text-center lg:text-left mb-12">
          <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.3em] block mb-2">Curation Submission</span>
          <h1 className="editorial-text text-4xl md:text-6xl font-light">Hang Your Work</h1>
          <p className="text-xs font-mono text-zinc-500 mt-2 max-w-sm mx-auto lg:mx-0">Configure your canvas below. All uploads are moderated.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Form ── */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-zinc-900 p-4 md:p-8">
            <form onChange={() => trackFormStart('field')} onSubmit={handleFormSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Canvas Title</label>
                <input type="text" placeholder="e.g. Cyberpunk Reverie" value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-mono px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50" />
              </div>

              {/* Image/Video upload - conditional based on category */}
              {isVideoCategory ? (
                <VideoUploader
                  videoFile={videoFile}
                  coverFile={coverFile}
                  onVideoSelect={setVideoFile}
                  onCoverSelect={setCoverFile}
                  onRemoveVideo={() => setVideoFile(null)}
                  onRemoveCover={() => setCoverFile(null)}
                />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400">Artwork Image</label>
                    <span className="text-[9px] font-mono text-exhibition-gold lg:hidden uppercase tracking-widest animate-pulse">
                      ↓ Scroll down for preview ↓
                    </span>
                  </div>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-zinc-800 cursor-pointer hover:border-exhibition-gold/50 transition-colors">
                      <UploadCloud className="w-8 h-8 text-zinc-600 mb-3" />
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Click to upload</span>
                      <span className="font-mono text-[8px] text-zinc-600 mt-1">PNG, JPG, GIF · max 10MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="relative w-full h-44 border border-zinc-800 overflow-hidden bg-black/20">
                      <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="font-mono text-[10px] text-exhibition-gold animate-pulse uppercase tracking-widest">Uploading...</span>
                        </div>
                      )}
                      {uploadedUrl && !uploading && (
                        <div className="absolute bottom-2 left-2 bg-exhibition-gold text-exhibition-void px-2 py-0.5 text-[8px] font-mono font-bold uppercase">Uploaded ✓</div>
                      )}
                      <button type="button" onClick={clearImage}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/80 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Orientation / Dimension ── */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-3">
                  Orientation &amp; Dimension
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ORIENTATIONS.map(o => (
                    <button key={o.id} type="button" onClick={() => setOrientation(o.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-1 border transition-all ${
                        orientation === o.id
                          ? 'border-exhibition-gold bg-exhibition-gold/5 text-exhibition-gold'
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}>
                      {/* Mini ratio preview */}
                      <div className={`bg-current opacity-30 rounded-[1px] ${
                        o.id === 'landscape'  ? 'w-8 h-[21px]' :
                        o.id === 'portrait'   ? 'w-[14px] h-6' :
                        o.id === 'square'     ? 'w-5 h-5' :
                        o.id === 'widescreen' ? 'w-9 h-[20px]' :
                        /* vertical */          'w-[14px] h-[25px]'
                      }`} style={{ backgroundColor: 'currentColor' }} />
                      <span className="font-mono text-[6.5px] sm:text-[8px] uppercase tracking-tighter sm:tracking-wide leading-none text-center whitespace-nowrap">{o.label}</span>
                      <span className="font-mono text-[7px] text-zinc-600 leading-none">{o.ratio.replace('/', ':')}</span>
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[8px] text-zinc-600 mt-2">{selectedOrient.note}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-3">Category</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {EVENT_CATEGORIES.map(cat => (
                    <div key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                      className={`border p-3 cursor-pointer text-center transition-all ${
                        category === cat.id ? 'border-exhibition-gold bg-exhibition-gold/5 text-exhibition-gold' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Room {cat.room}</div>
                      <div className="text-[11px] font-mono uppercase mt-1 font-bold">{cat.label}</div>
                    </div>
                  ))}
                </div>

                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Subcategory</label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCat.subcategories.map(sub => (
                    <div key={sub} onClick={() => setSubcategory(sub)}
                      className={`border px-3 py-2.5 cursor-pointer text-center transition-all ${
                        subcategory === sub ? 'border-exhibition-gold bg-exhibition-gold/5 text-exhibition-gold' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}>
                      <div className="text-[10px] font-mono uppercase tracking-wide">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Conceptual Statement</label>
                <textarea rows={4} placeholder="The story behind your canvas..." value={description} onChange={e => setDescription(e.target.value)} required
                  className="w-full bg-[#121212] border border-zinc-800 text-xs font-sans px-4 py-3 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50 resize-none" />
              </div>

              {error && <p className="font-mono text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">{error}</p>}

              <button type="submit" disabled={submitting || uploading || (isVideoCategory && (!videoFile || !coverFile))}
                className="w-full py-4 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : uploading ? 'Wait for upload...' : 'Submit for Curation Review'}
              </button>
            </form>
          </div>

          {/* ── Live preview ── */}
          <div className="lg:col-span-5">
            <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Corridor Placard Preview</h3>
            <div className="border border-zinc-900 bg-black/10 p-6">
              {/* Preview box uses the selected orientation ratio */}
              <div className={`museum-frame relative overflow-hidden mb-4 w-full ${selectedOrient.css}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-contain bg-black" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs gap-2">
                    <span className="text-2xl opacity-20">{selectedOrient.icon}</span>
                    <span className="text-[8px] uppercase tracking-widest">{selectedOrient.note}</span>
                  </div>
                )}
                {/* Ratio tag */}
                <div className="absolute bottom-2 right-2 bg-black/80 border border-zinc-700 px-2 py-0.5 font-mono text-[7px] text-zinc-400 uppercase">
                  {selectedOrient.ratio.replace('/', ':')}
                </div>
              </div>
              <div className="bg-[#0d0d0d] border border-exhibition-gold/20 p-4 text-center">
                <h4 className="editorial-text text-xl font-bold text-exhibition-bone">{title || 'Untitled Canvas'}</h4>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                  {category.replace('-', ' ')} · {selectedOrient.label}
                </p>
              </div>
            </div>

            <div className="border border-zinc-900/60 p-5 mt-6 bg-[#090909]">
              <h4 className="font-mono text-[9px] text-exhibition-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles size={12} /> Museum Guidelines
              </h4>
              <ul className="space-y-2 font-mono text-[9px] text-zinc-500 leading-relaxed list-disc pl-4 uppercase">
                <li>Artworks must be fully owned by the submitting student.</li>
                <li>Curation approval typically finishes within few hours.</li>
                <li>Approved canvases will be mounted in the corridor lobby.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
