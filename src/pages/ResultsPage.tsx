import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ExhibitionNav from '../components/ExhibitionNav'
import ResultsSection from '../components/ResultsSection'
import { useSpotlightAll } from '../hooks/useSpotlight'
import { trackEvent } from '../lib/analytics'

/**
 * Dedicated results page — replaces the submission page now that the event has
 * concluded. The podium itself lives in <ResultsSection>, which reads live
 * artwork data from the backend.
 */
export default function ResultsPage() {
  const navigate = useNavigate()
  useSpotlightAll('.spot-md, .spot-lg, .spot-xl')

  useEffect(() => {
    trackEvent('results_page_view', {})
  }, [])

  return (
    <div className="min-h-screen bg-exhibition-void text-exhibition-bone selection:bg-exhibition-gold selection:text-exhibition-void">
      <ExhibitionNav />

      {/* Header */}
      <header className="relative overflow-hidden border-b border-exhibition-gold/15 px-4 sm:px-6 md:px-12 pt-10 sm:pt-14 pb-12 sm:pb-16">
        {/* Ceiling wash */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(90vw,40rem)] h-40 bg-exhibition-gold/10 blur-3xl rounded-full pointer-events-none" />

        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-[0.25em] hover:text-exhibition-gold transition-colors"
        >
          <ArrowLeft size={12} className="flex-shrink-0" />
          Exhibition Hall
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center mt-8 sm:mt-10"
        >
          <span className="font-mono text-[9px] sm:text-[10px] text-exhibition-gold uppercase tracking-[0.35em] block mb-4">
            Lenscape 2026 · Summer at Your Place
          </span>
          <h1 className="editorial-text text-4xl sm:text-6xl md:text-7xl font-light text-exhibition-bone px-2 leading-tight">
            The Results
          </h1>
          <p className="font-mono text-[11px] sm:text-xs text-zinc-400 leading-relaxed max-w-lg mx-auto mt-5 px-4">
            Every frame has been hung, every vote counted, every deliberation closed.
            These are the works that carried the exhibition.
          </p>
        </motion.div>
      </header>

      {/* Podium */}
      <main className="px-4 sm:px-6 md:px-12 pt-14 sm:pt-20">
        <ResultsSection />
      </main>

      {/* Closing note + onward links */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24 text-center">
        <span className="font-mono text-[10px] text-exhibition-gold uppercase tracking-[0.3em] block mb-4">
          A Note From The Curators
        </span>
        <p className="editorial-text text-lg sm:text-xl md:text-2xl font-light text-exhibition-bone/90 leading-relaxed italic">
          "Thank you for walking these halls with us — for every frame captured, every story
          told, and every risk taken behind the lens. This exhibition exists because of you."
        </p>
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mt-5">
          — Team Lenscape × JLUG
        </span>

        <button
          onClick={() => navigate('/gallery')}
          className="mt-10 inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 bg-exhibition-gold text-exhibition-void font-mono font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Browse Every Entry
          <ArrowRight size={13} className="flex-shrink-0" />
        </button>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto border-t border-zinc-900 px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-5 mb-24">
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-center">
          LENSCAPE © 2026 // ORGANIZED BY JLUG CLUB
        </span>
        <div className="flex flex-wrap justify-center gap-5 sm:gap-8 font-mono text-[9px] tracking-widest uppercase text-zinc-400">
          <Link to="/" className="hover:text-exhibition-gold transition-colors">Exhibition Hall</Link>
          <Link to="/gallery" className="hover:text-exhibition-gold transition-colors">Rooms</Link>
          <Link to="/profile" className="hover:text-exhibition-gold transition-colors">Profile</Link>
        </div>
      </footer>
    </div>
  )
}
