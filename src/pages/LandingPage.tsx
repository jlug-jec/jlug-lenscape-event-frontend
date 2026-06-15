import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Heart, ArrowRight, Send, Info, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authHeaders } from '../lib/session'
import { Artwork } from '../types'
import CinematicIntro from '../components/CinematicIntro'
import ExhibitionNav from '../components/ExhibitionNav'
import ThreeExhibitionScene from '../components/ThreeExhibitionScene'
import ArtworkFrame from '../components/ArtworkFrame'
import { useSpotlightAll } from '../hooks/useSpotlight'
import ArtworkViewerModal from '../components/UI/ArtworkViewerModal'
import VoteConfirmationModal from '../components/UI/VoteConfirmationModal'
import AlreadyVotedModal from '../components/UI/AlreadyVotedModal'
import SuccessToast from '../components/UI/SuccessToast'
import ErrorToast from '../components/UI/ErrorToast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function LandingPage() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  
  useSpotlightAll('.spot-md, .spot-lg, .spot-xl')

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [categories] = useState(['photography', 'digital-art', 'cinematography', 'motion-graphics'])
  const [introComplete, setIntroComplete] = useState<boolean>(() => {
    return sessionStorage.getItem('lenscape_intro_complete') === 'true'
  })
  // Delay mounting the 3D scene so the intro overlay always paints first
  const [sceneReady, setSceneReady] = useState<boolean>(() => {
    return sessionStorage.getItem('lenscape_intro_complete') === 'true'
  })

  useEffect(() => {
    if (!sceneReady) {
      const t = setTimeout(() => setSceneReady(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [showNav, setShowNav] = useState(false)
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false)
  const [showAlreadyVotedWarning, setShowAlreadyVotedWarning] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const chambersRef = useRef<HTMLElement>(null)

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [showPlacard, setShowPlacard] = useState(true)

  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    if (selectedArtwork) {
      setShowPlacard(true)
      setShowVideoModal(false)
    }
  }, [selectedArtwork])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch approved artworks from backend
  useEffect(() => {
    fetch(`${API}/api/artworks`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setArtworks(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (chambersRef.current) {
        const top = chambersRef.current.getBoundingClientRect().top
        // Show nav when chambers section enters viewport
        if (top < window.innerHeight - 100) {
          setShowNav(true)
        } else {
          setShowNav(false)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    // Trigger once on mount to set initial state
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem('lenscape_intro_complete', 'true')
    setIntroComplete(true)
  }

  // Filter approved artworks
  const approvedArtworks = artworks.filter((a) => a.status === 'approved')
  
  // Lenscape 2024 Hall of Fame Winners (uploaded to Cloudinary)
  const lenscape2025Winners: Artwork[] = [
    {
      id: 'winner-photo-2025',
      title: 'Your CSE Journey Begins Here',
      category: 'digital-art',
      subCategory: 'concept-art',
      artist: { 
        id: 'gupta-squad',
        name: 'Gupta squad', 
        email: '',
        college: 'Lenscape 2024',
        branch: '',
        year: '',
        avatar: null,
        bio: '',
        joinedDate: new Date('2024-10-26')
      },
      votes: 30,
      imageUrl: 'https://res.cloudinary.com/dsjhcv06g/image/upload/v1781086583/lenscape/winners2025/photography-winner.jpg',
      thumbnailUrl: null,
      videoUrl: null,
      description: 'Digital Art Domain | 30 votes',
      status: 'approved' as const,
      comments: [],
      createdAt: new Date('2024-10-26'),
    },
    {
      id: 'winner-photo-sunscape-2025',
      title: 'A close-up view of water flowing through loose, muddy soil, capturing the effects of erosion.',
      category: 'photography',
      subCategory: 'landscape-photography',
      artist: { 
        id: 'sunscape',
        name: 'Sunscape', 
        email: '',
        college: 'Lenscape 2024',
        branch: '',
        year: '',
        avatar: null,
        bio: '',
        joinedDate: new Date('2024-10-25')
      },
      votes: 38,
      imageUrl: 'https://res.cloudinary.com/dsjhcv06g/image/upload/v1781087869/lenscape/winners2025/photography-sunscape.jpg',
      thumbnailUrl: null,
      videoUrl: null,
      description: 'A close-up view of water flowing through loose, muddy soil, capturing the effects of erosion.',
      status: 'approved' as const,
      comments: [],
      createdAt: new Date('2024-10-25'),
    },
    {
      id: 'winner-digitalart-2025',
      title: 'Peaceful damage',
      category: 'photography',
      subCategory: 'landscape-photography',
      artist: { 
        id: 'rockers',
        name: 'Rockers', 
        email: '',
        college: 'Lenscape 2024',
        branch: '',
        year: '',
        avatar: null,
        bio: '',
        joinedDate: new Date('2024-10-25')
      },
      votes: 36,
      imageUrl: 'https://res.cloudinary.com/dsjhcv06g/image/upload/v1781086584/lenscape/winners2025/digitalart-winner.jpg',
      thumbnailUrl: null,
      videoUrl: null,
      description: 'Photography Domain | 36 votes',
      status: 'approved' as const,
      comments: [],
      createdAt: new Date('2024-10-25'),
    },
    {
      id: 'winner-digitalart-grunge-spidey-2025',
      title: 'Grunge Spidey',
      category: 'digital-art',
      subCategory: 'character-design',
      artist: { 
        id: 'pranjal-verma',
        name: 'PRANJAL VERMA', 
        email: '',
        college: 'Lenscape 2024',
        branch: '',
        year: '',
        avatar: null,
        bio: '',
        joinedDate: new Date('2024-10-20')
      },
      votes: 18,
      imageUrl: 'https://res.cloudinary.com/dsjhcv06g/image/upload/v1781087868/lenscape/winners2025/digitalart-grunge-spidey.jpg',
      thumbnailUrl: null,
      videoUrl: null,
      description: 'Digital Art Domain | Spider-Man artwork with grunge aesthetic',
      status: 'approved' as const,
      comments: [],
      createdAt: new Date('2024-10-20'),
    },
  ]
  


  // Handle voting from modal/frames - only for backend sync, no UI update
  const handleVote = async (artId: string) => {
    if (!user) return
    try {
      const res = await fetch(`${API}/api/artworks/${artId}/vote`, { method: 'POST', headers: authHeaders() })
      const data = await res.json()
      
      if (res.ok) {
        // Don't update UI here - already done optimistically
        return true
      } else {
        // Show error message
        setErrorMessage(data.error || 'Failed to cast vote')
        setShowErrorToast(true)
        setTimeout(() => setShowErrorToast(false), 4000)
        return false
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 4000)
      return false
    }
  }

  // Handle vote button click - show confirmation or warning
  const handleVoteClick = () => {
    if (!user || !selectedArtwork) return
    // Check if user has already voted in this category
    const category = selectedArtwork.category
    if (user.votedCategories && user.votedCategories.includes(category)) {
      setShowAlreadyVotedWarning(true)
      return
    }
    setShowVoteConfirmation(true)
  }

  // Confirm vote
  const confirmVote = async () => {
    if (!selectedArtwork || !user) return
    
    const artworkId = selectedArtwork.id
    const category = selectedArtwork.category
    
    // Optimistic update - update UI immediately
    setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, votes: a.votes + 1 } : a))
    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork(a => a ? { ...a, votes: a.votes + 1 } : a)
    }
    
    // Update user state optimistically
    const { updateProfile } = useAuthStore.getState()
    const currentVoted = user.votedCategories || []
    updateProfile({ votedCategories: [...currentVoted, category] })
    
    // Close confirmation modal
    setShowVoteConfirmation(false)
    
    // Show success toast
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
    
    // Make API call in background
    const success = await handleVote(artworkId)
    
    // If failed, revert optimistic update
    if (!success) {
      setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, votes: a.votes - 1 } : a))
      if (selectedArtwork?.id === artworkId) {
        setSelectedArtwork(a => a ? { ...a, votes: a.votes - 1 } : a)
      }
      updateProfile({ votedCategories: currentVoted })
    }
  }

  // Check if user has already voted in the selected artwork's category
  const hasVoted = selectedArtwork 
    ? Boolean(user?.votedCategories?.includes(selectedArtwork.category))
    : false

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent, artId: string) => {
    e.preventDefault()
    if (!commentContent.trim() || !user) return
    try {
      const res = await fetch(`${API}/api/artworks/${artId}/comment`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ content: commentContent.trim() }),
      })
      if (res.ok) {
        const comment = await res.json()
        setArtworks(prev => prev.map(a => a.id === artId ? { ...a, comments: [...a.comments, comment] } : a))
        if (selectedArtwork?.id === artId) setSelectedArtwork(a => a ? { ...a, comments: [...a.comments, comment] } : a)
        setCommentContent('')
      }
    } catch {}
  }

  // Scroll-driven fade + lift for the corridor overlay text
  const { scrollY } = useScroll()
  const useScrollFade = useTransform(scrollY, [0, 400], [1, 0])
  const useScrollY = useTransform(scrollY, [0, 400], [0, -80])

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone selection:bg-exhibition-gold selection:text-exhibition-void relative">

      {/* 1. Cinematic Preloader Intro — sits on top (z-1000), 3D scene loads behind it */}
      <AnimatePresence>
        {!introComplete && (
          <CinematicIntro
            onComplete={handleIntroComplete}
            preloadUrls={lenscape2025Winners
              .map(w => w.thumbnailUrl || w.imageUrl)
              .filter(Boolean) as string[]}
          />
        )}
      </AnimatePresence>

      {/* 2. Main content — always mounted so 3D scene initialises during intro */}
      <motion.div
        initial={introComplete ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        // Keep non-interactive while intro is playing so scroll/clicks don't bleed through
        style={{ pointerEvents: introComplete ? 'auto' : 'none' }}
      >
          {/* Navigation Guide */}
          <ExhibitionNav isVisible={showNav} />

          {/* 
            Scroll-jacked 3D corridor.
            The outer div is 300vh tall — this is the "scroll budget" for the camera walk.
            The inner div is sticky, so the canvas stays fixed while the user scrolls
            through the 300vh. Once past it, normal page content resumes.
          */}
          <div className="relative" style={{ height: '300vh' }} data-corridor="true">
            <div className="sticky top-0 w-full h-screen overflow-hidden">
              {/* 3D scene — delayed mount so intro overlay always paints first */}
              <div className="absolute inset-0 w-full h-full pointer-events-auto">
                {sceneReady && (
                  <ThreeExhibitionScene
                    onArtworkSelect={(art) => {
                      setSelectedArtwork(art)
                      setHasInteracted(true)
                    }}
                    artworks={lenscape2025Winners}
                    selectedArtwork={selectedArtwork}
                    enabled={introComplete}
                  />
                )}
              </div>

              {/* Text overlay — fades + moves up as user starts scrolling, unmounts cleanly on selection */}
              <AnimatePresence>
                {!selectedArtwork && !hasInteracted && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: useScrollFade, y: useScrollY }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-10"
                  >
                    <span className="font-mono text-[10px] text-exhibition-gold uppercase tracking-[0.3em] mb-4">
                      Glimpse of 2024
                    </span>
                    <h1 className="editorial-text text-4xl md:text-6xl text-exhibition-bone max-w-2xl font-light">
                      Hall of Fame
                    </h1>
                    <p className="font-sans text-xs text-zinc-500 mt-3 max-w-sm tracking-wide">
                      Walk through the glimpse of 2024. Click on any frame to inspect the artwork.
                    </p>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[1px] h-12 bg-exhibition-gold/50 mt-10"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Main scrollable section overlays */}
          <div className="relative z-10 bg-exhibition-void/90 backdrop-blur-md border-t border-exhibition-gold/15 py-32 px-6 md:px-12">
            
            {/* Section: Event Info */}
            <section className="max-w-4xl mx-auto mb-40">
              <div className="border border-exhibition-gold/20 bg-black/40 p-10 md:p-12">
                <div className="text-center mb-8">
                  <span className="font-mono text-xs text-exhibition-gold uppercase tracking-[0.3em] block mb-3">
                    Lenscape 2026 Competition
                  </span>
                  <h2 className="editorial-text text-3xl md:text-5xl font-light text-exhibition-bone">
                    How It Works
                  </h2>
                </div>

                <div className="space-y-6 text-sm font-mono text-zinc-400 leading-relaxed">
                  <div className="flex gap-4">
                    <span className="text-exhibition-gold font-bold flex-shrink-0">01</span>
                    <div>
                      <h3 className="text-exhibition-gold font-bold mb-2 uppercase tracking-wide">Submit Your Work</h3>
                      <p>Create and submit your artwork in any of our 4 categories. Each submission goes through curation before being displayed in the gallery.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-exhibition-gold font-bold flex-shrink-0">02</span>
                    <div>
                      <h3 className="text-exhibition-gold font-bold mb-2 uppercase tracking-wide">Community Voting</h3>
                      <p>Vote for your favorite artwork in each category. <span className="text-exhibition-bone font-bold">You can cast one vote per category</span> — choose wisely!</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-exhibition-gold font-bold flex-shrink-0">03</span>
                    <div>
                      <h3 className="text-exhibition-gold font-bold mb-2 uppercase tracking-wide">Winners Announced</h3>
                      <p>The artworks with the most votes in each category will be crowned winners and showcased in our Hall of Honor.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
                  <p className="text-xs font-mono text-zinc-500">
                    <span className="text-exhibition-gold">4 Categories</span> · <span className="text-exhibition-gold">4 Votes Total</span> · <span className="text-exhibition-gold">Fair Competition</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Event Themes */}
            <section className="max-w-6xl mx-auto mb-40">
              <div className="text-center mb-16">
                <span className="font-mono text-xs text-exhibition-gold uppercase tracking-[0.25em] block mb-3">
                  Lenscape 2026
                </span>
                <h2 className="editorial-text text-4xl md:text-6xl font-light">
                  Event Theme
                </h2>
              </div>

              <div className="max-w-3xl mx-auto border border-exhibition-gold/15 p-10 md:p-12 relative overflow-hidden group text-center bg-black/40">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-exhibition-gold/3 to-transparent pointer-events-none" />
                <h3 className="editorial-text text-3xl md:text-5xl font-light text-exhibition-bone mb-4">
                  Summer at Your Place
                </h3>
                <p className="font-mono text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Capture the warmth, intimacy and vibrancy of summer through your lens — your home, your city, your people.
                </p>
              </div>

              {/* Categories overview */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-exhibition-gold/10">
                {[
                  { room: '01', cat: 'Photography', subs: ['Portrait', 'Landscape'] },
                  { room: '02', cat: 'Digital Art', subs: ['Concept Art', 'Character Design'] },
                  { room: '03', cat: 'Cinematography', subs: ['Short Film', 'Travel Film'] },
                  { room: '04', cat: 'Motion Graphics', subs: ['Logo Animation', 'Explainer Video'] },
                ].map(item => (
                  <div key={item.room} className="bg-exhibition-void p-6">
                    <span className="font-mono text-[9px] text-zinc-600 block mb-2 uppercase tracking-widest">Room {item.room}</span>
                    <h4 className="font-mono text-sm font-bold text-exhibition-gold uppercase tracking-wide mb-3">{item.cat}</h4>
                    <ul className="space-y-1">
                      {item.subs.map(s => (
                        <li key={s} className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-exhibition-gold/40 rounded-full flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Guidelines */}
            <section className="max-w-4xl mx-auto mb-40">
              <div className="border border-zinc-900 bg-black/20 p-10 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-exhibition-gold/5 blur-3xl rounded-full" />
                <div className="text-center mb-8">
                  <span className="font-mono text-xs text-exhibition-gold uppercase tracking-[0.3em] block mb-3">
                    Submission & Exhibition
                  </span>
                  <h2 className="editorial-text text-3xl md:text-5xl font-light text-exhibition-bone">
                    Event Guidelines
                  </h2>
                </div>

                <div className="space-y-8 max-w-3xl mx-auto text-sm font-mono text-zinc-400 leading-relaxed">
                  <div>
                    <h4 className="text-exhibition-gold font-semibold uppercase tracking-wider mb-2 text-sm md:text-base">1. Format & Quality</h4>
                    <p>Images should be high-resolution (minimum 1080p) in JPEG/PNG formats. Videos must be in MP4/WebM format, not exceeding 8 minutes in duration.</p>
                  </div>
                  <div>
                    <h4 className="text-exhibition-gold font-semibold uppercase tracking-wider mb-2 text-sm md:text-base">2. Core Theme Alignment</h4>
                    <p>All artwork submissions must creatively interpret the official theme: <span className="text-exhibition-bone font-bold">"Summer at Your Place"</span>.</p>
                  </div>
                  <div>
                    <h4 className="text-exhibition-gold font-semibold uppercase tracking-wider mb-2 text-sm md:text-base">3. Originality & Ownership</h4>
                    <p>Strictly original works only. Plagiarism, unauthorized use of copyrighted elements, or utilizing AI generation tools is strictly prohibited. Any submission found copying existing artworks or using AI will result in immediate disqualification.</p>
                  </div>
                  <div>
                    <h4 className="text-exhibition-gold font-semibold uppercase tracking-wider mb-2 text-sm md:text-base">4. Code of Conduct</h4>
                    <p>Submissions must be respectful and free from offensive or inappropriate content. The curation board reserves the right to reject entries.</p>
                  </div>
                  <div>
                    <h4 className="text-exhibition-gold font-semibold uppercase tracking-wider mb-2 text-sm md:text-base">5. Judging & Selection</h4>
                    <p className="mb-3">The final result will be determined by a combination of public opinion and expert evaluation. 50% of the weightage relies on public voting, and the remaining 50% is determined by the official judges' decision.</p>
                    <p className="text-exhibition-bone font-bold mb-2">Submissions will be evaluated based on:</p>
                    <ul className="space-y-2 pl-4 border-l border-exhibition-gold/20">
                      <li>
                        <span className="text-exhibition-gold font-bold">Creativity:</span> Original imagination and artistic interpretation.
                      </li>
                      <li>
                        <span className="text-exhibition-gold font-bold">Uniqueness:</span> Distinct style, innovation, and conceptual depth.
                      </li>
                      <li>
                        <span className="text-exhibition-gold font-bold">Visual Impact:</span> Overall execution and aesthetic appeal.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Exhibition Rooms CTA */}
            <section ref={chambersRef} className="max-w-5xl mx-auto mb-32">
              <div className="text-center mb-20">
                <span className="font-mono text-xs text-exhibition-gold uppercase tracking-[0.25em] block mb-3">
                  Select a Room
                </span>
                <h2 className="editorial-text text-4xl md:text-5xl font-light">
                  Exhibition Chambers
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Photography wing */}
                <div
                  onClick={() => navigate('/gallery?cat=photography')}
                  className="spot-md group cursor-pointer border border-exhibition-gold/15 bg-black/40 p-8 rounded-none hover:border-exhibition-gold/60 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-exhibition-gold/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Room 01</span>
                  <h3 className="editorial-text text-2xl font-bold text-exhibition-bone mt-2 group-hover:text-exhibition-gold transition-colors">
                    Photography
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
                    Portrait Photography · Landscape Photography
                  </p>
                  <div className="flex items-center gap-2 mt-6 font-mono text-[10px] text-exhibition-gold uppercase tracking-widest">
                    <span>Enter Wing</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Digital Art wing */}
                <div
                  onClick={() => navigate('/gallery?cat=digital-art')}
                  className="spot-md group cursor-pointer border border-exhibition-gold/15 bg-black/40 p-8 rounded-none hover:border-exhibition-gold/60 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-exhibition-gold/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Room 02</span>
                  <h3 className="editorial-text text-2xl font-bold text-exhibition-bone mt-2 group-hover:text-exhibition-gold transition-colors">
                    Digital Art
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
                    Concept Art · Character Design
                  </p>
                  <div className="flex items-center gap-2 mt-6 font-mono text-[10px] text-exhibition-gold uppercase tracking-widest">
                    <span>Enter Wing</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Cinematography wing */}
                <div
                  onClick={() => navigate('/gallery?cat=cinematography')}
                  className="spot-md group cursor-pointer border border-exhibition-gold/15 bg-black/40 p-8 rounded-none hover:border-exhibition-gold/60 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-exhibition-gold/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Room 03</span>
                  <h3 className="editorial-text text-2xl font-bold text-exhibition-bone mt-2 group-hover:text-exhibition-gold transition-colors">
                    Cinematography
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
                    Short Film · Travel Film
                  </p>
                  <div className="flex items-center gap-2 mt-6 font-mono text-[10px] text-exhibition-gold uppercase tracking-widest">
                    <span>Enter Wing</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Motion Graphics wing */}
                <div
                  onClick={() => navigate('/gallery?cat=motion-graphics')}
                  className="spot-md group cursor-pointer border border-exhibition-gold/15 bg-black/40 p-8 rounded-none hover:border-exhibition-gold/60 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-exhibition-gold/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">Room 04</span>
                  <h3 className="editorial-text text-2xl font-bold text-exhibition-bone mt-2 group-hover:text-exhibition-gold transition-colors">
                    Motion Graphics
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
                    Logo Animation · Explainer Video
                  </p>
                  <div className="flex items-center gap-2 mt-6 font-mono text-[10px] text-exhibition-gold uppercase tracking-widest">
                    <span>Enter Wing</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Submit portal callout */}
              <div className="mt-16 border border-exhibition-gold/25 p-10 bg-black/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h4 className="editorial-text text-xl font-bold text-exhibition-gold">
                    Have your artwork shown in the corridor?
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Submit your creations to be curated and voted on by peers.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/submit')}
                  className="px-6 py-3 bg-exhibition-gold text-exhibition-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors self-start md:self-auto"
                >
                  Add Your Canvas
                </button>
              </div>
            </section>


            {/* Footer */}
            <footer className="max-w-6xl mx-auto border-t border-zinc-900 pt-16 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  LENSCAPE © 2026 // ORGANIZED BY JLUG CLUB
                </span>
              </div>
              <div className="flex gap-8 font-mono text-[9px] tracking-widest uppercase text-zinc-400">
                <Link to="/gallery" className="hover:text-exhibition-gold transition-colors">Exhibition</Link>
                <Link to="/submit" className="hover:text-exhibition-gold transition-colors">Submit</Link>
                <Link to="/profile" className="hover:text-exhibition-gold transition-colors">Profile</Link>
              </div>
            </footer>
          </div>

          {/* Immersive Artwork Details Placard */}
          <AnimatePresence>
            {selectedArtwork && showPlacard && (
              <motion.div
                key="placard-details"
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-4 left-1/2 w-[92%] max-w-[360px] bg-black/95 backdrop-blur-md border border-exhibition-gold/30 p-4 text-exhibition-bone z-[100] shadow-2xl rounded-sm flex flex-col gap-2 pointer-events-auto"
              >
                {/* Hide Placard Button */}
                <button
                  onClick={() => setShowPlacard(false)}
                  className="absolute top-3.5 right-9 text-zinc-400 hover:text-exhibition-gold transition-colors text-[9px] font-mono px-1.5 py-0.5 border border-zinc-800 hover:border-exhibition-gold/30 rounded-sm uppercase tracking-widest"
                  title="Hide details"
                >
                  Hide
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-exhibition-gold transition-colors text-base p-1"
                  aria-label="Close details"
                >
                  ✕
                </button>

                {/* Category tag */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[7.5px] text-exhibition-gold uppercase tracking-[0.2em] border border-exhibition-gold/20 px-2 py-0.5 rounded-full">
                    {selectedArtwork.category.replace('-', ' ')}
                  </span>
                  {selectedArtwork.subCategory && (
                    <span className="font-mono text-[7.5px] text-zinc-500 uppercase tracking-[0.2em]">
                      • {selectedArtwork.subCategory.replace('-', ' ')}
                    </span>
                  )}
                </div>

                {/* Title and Artist */}
                <div className="pr-16">
                  <h3 className="font-sans text-[15px] font-medium text-exhibition-bone tracking-wide leading-tight">
                    {selectedArtwork.title}
                  </h3>
                  <p className="font-sans text-[11px] text-zinc-400 mt-0.5">
                    By <span className="text-zinc-200 font-medium">{selectedArtwork.artist.name}</span>
                    {selectedArtwork.artist.college && ` (${selectedArtwork.artist.college})`}
                  </p>
                </div>

                {/* Motivational Quote at top of placard if Starry Night */}
                {selectedArtwork.id === 'starry-night-popular' && (
                  <div className="border-t border-b border-exhibition-gold/15 py-2 my-0.5">
                    <p className="font-serif italic text-[11px] text-exhibition-gold text-center tracking-wide leading-relaxed">
                      "Great things are done by a series of small things brought together."
                    </p>
                    <p className="font-mono text-[8px] text-zinc-500 text-center mt-0.5 uppercase tracking-widest">
                      — Vincent van Gogh
                    </p>
                  </div>
                )}

                {/* Description */}
                <p className="font-sans text-[11px] text-zinc-400 leading-normal max-h-16 overflow-y-auto pr-2 scrollbar-thin">
                  {selectedArtwork.description}
                </p>

                {/* Bottom Bar: Action buttons */}
                <div className="flex items-center justify-between mt-0.5 pt-2 border-t border-zinc-900">
                  <span className="font-mono text-[9.5px] text-zinc-500">
                    {selectedArtwork.id === 'starry-night-popular' ? 'Featured Masterpiece' : 'Hall of Fame · 2024'}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    {selectedArtwork.videoUrl && (
                      <button
                        onClick={() => setShowVideoModal(true)}
                        className="font-mono text-[9.5px] text-exhibition-gold uppercase tracking-wider hover:underline transition-all flex items-center gap-1 font-bold pointer-events-auto"
                      >
                        <span>▶ Play Video</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedArtwork(null)}
                      className="font-mono text-[9.5px] text-zinc-400 hover:text-exhibition-gold uppercase tracking-wider hover:underline transition-all pointer-events-auto"
                    >
                      Back to Gallery
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Floating button when placard is hidden */}
            {selectedArtwork && !showPlacard && (
              <motion.button
                key="show-placard-btn"
                initial={{ opacity: 0, y: 30, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 30, x: '-50%' }}
                onClick={() => setShowPlacard(true)}
                className="fixed bottom-6 left-1/2 bg-black/95 hover:bg-exhibition-gold hover:text-exhibition-void text-exhibition-bone border border-exhibition-gold/30 px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all rounded-sm shadow-2xl z-[100] flex items-center gap-1.5 pointer-events-auto"
              >
                <Info size={12} className="text-exhibition-gold" />
                <span>Show Details</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Full-screen Video Lightbox Modal */}
          <AnimatePresence>
            {showVideoModal && selectedArtwork && selectedArtwork.videoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 pointer-events-auto"
                onClick={() => setShowVideoModal(false)}
              >
                {/* Screen-level Close button (easy to touch on mobile) */}
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="absolute top-4 right-4 z-[210] w-10 h-10 border border-exhibition-gold/20 flex items-center justify-center hover:bg-exhibition-gold hover:text-exhibition-void text-exhibition-gold transition-colors font-mono"
                  aria-label="Close player"
                >
                  ✕
                </button>

                <div 
                  className="relative w-full max-w-4xl aspect-video bg-black border border-exhibition-gold/30 shadow-2xl flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedArtwork.videoUrl.includes('drive.google.com') || selectedArtwork.videoUrl.includes('/preview') ? (
                    <iframe
                      src={selectedArtwork.videoUrl}
                      title={selectedArtwork.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={selectedArtwork.videoUrl}
                      poster={selectedArtwork.imageUrl || undefined}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vote Confirmation Modal */}
          <AnimatePresence>
            {showVoteConfirmation && (
              <VoteConfirmationModal
                setShowVoteConfirmation={setShowVoteConfirmation}
                confirmVote={confirmVote}
              />
            )}
          </AnimatePresence>

          {/* Already Voted Warning Modal */}
          <AnimatePresence>
            {showAlreadyVotedWarning && (
              <AlreadyVotedModal
                setShowAlreadyVotedWarning={setShowAlreadyVotedWarning}
              />
            )}
          </AnimatePresence>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <SuccessToast
                setShowSuccessToast={setShowSuccessToast}
              />
            )}
          </AnimatePresence>

          {/* Error Toast */}
          <AnimatePresence>
            {showErrorToast && (
              <ErrorToast
                setShowErrorToast={setShowErrorToast}
                errorMessage={errorMessage}
              />
            )}
          </AnimatePresence>
        </motion.div>
    </div>
  )
}

