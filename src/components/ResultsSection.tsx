import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Play, X } from 'lucide-react'
import { useResults, ResultArtwork, ResultCategory } from '../hooks/useResults'
import { ratioOf } from '../types'

/**
 * Announced results for Lenscape 2026.
 *
 * Placements and artwork data both come from `GET /api/results`, which joins
 * the final ranking against the live artworks collection — so titles, media
 * and artist names here are always whatever the backend currently holds.
 * FALLBACK_RESULTS keeps the section meaningful (text only) if that call fails.
 *
 * Layout is mobile-first: every card is a full-width stacked block on phones;
 * only from `md` does the podium fan out into two columns, with the
 * first-place card keeping the full span and switching to a side-by-side split.
 */

/** Medal palette — gold / chrome / bronze, tuned to sit beside the exhibition gold. */
const RANK_META: Record<number, { accent: string; glow: string; label: string; numeral: string }> = {
  1: { accent: '#C9A84C', glow: 'rgba(201, 168, 76, 0.28)', label: 'First Place', numeral: 'I' },
  2: { accent: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.20)', label: 'Second Place', numeral: 'II' },
  3: { accent: '#B87333', glow: 'rgba(184, 115, 51, 0.20)', label: 'Third Place', numeral: 'III' },
}

const rankMeta = (rank: number) => RANK_META[rank] || RANK_META[3]

/** Text-only mirror of the announced results, used only if the API is unreachable. */
const FALLBACK_RESULTS: ResultCategory[] = [
  {
    category: 'photography',
    label: 'Photography',
    room: '01',
    winners: [
      { rank: 1, name: 'Gaurav Prajapati', title: "A Stranger's Sunset" },
      { rank: 2, name: 'Shubham Suryavanshi', title: 'The Tree That Edits Light' },
      { rank: 3, name: 'Vishwajit Nigam', title: 'A Quiet Solstice' },
    ],
  },
  {
    category: 'cinematography',
    label: 'Cinematography',
    room: '02',
    winners: [
      { rank: 1, name: 'Satyam', title: 'The Curse of Miscommunication' },
      { rank: 2, name: 'Mohammad Haris', title: 'Finding Stories in Silence' },
      { rank: 3, name: 'Prashant Verma', title: "Summer's Passage" },
    ],
  },
  {
    category: 'digital-art',
    label: 'Digital Art',
    room: '03',
    winners: [
      { rank: 1, name: 'Rashi Chourasiya', title: 'Summer Days at the Farm' },
      { rank: 2, name: 'Gauri Singh Kushwaha', title: 'Retro Summer Pop Art' },
    ],
  },
].map(group => ({
  ...group,
  winners: group.winners.map(w => ({
    rank: w.rank,
    artwork: {
      id: `fallback-${group.category}-${w.rank}`,
      title: w.title,
      description: null,
      category: group.category,
      subcategory: null,
      imageUrl: null,
      thumbnailUrl: null,
      videoUrl: null,
      orientation: null,
      artist: { name: w.name, college: '', avatar: null },
    } as ResultArtwork,
  })),
}))

/* ── Media thumbnail ─────────────────────────────────────────────────────── */

const WinnerMedia: React.FC<{
  artwork: ResultArtwork
  accent: string
  numeral: string
}> = ({ artwork, accent, numeral }) => {
  const src = artwork.thumbnailUrl || artwork.imageUrl
  const isVideo = Boolean(artwork.videoUrl)
  // The frame takes the exact ratio the artist chose at submission, so the work
  // fills it edge to edge with nothing cropped away.
  const ratio = ratioOf(artwork.orientation)

  // A video entry with no poster still gets a framed placeholder rather than
  // collapsing the card's media column.
  if (!src) {
    return (
      <div
        className="w-full flex items-center justify-center bg-black/60"
        style={{ aspectRatio: String(ratio) }}
      >
        <span className="editorial-text text-5xl font-light opacity-20" style={{ color: accent }}>
          {numeral}
        </span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: String(ratio) }}
    >
      <img
        src={src}
        alt={artwork.title}
        loading="lazy"
        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
      />
      {/* Museum wash so the image sits in the room rather than on top of it */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

      {isVideo && (
        <span
          className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm border font-mono text-[9px] uppercase tracking-[0.2em]"
          style={{ color: accent, borderColor: `${accent}59` }}
        >
          <Play size={10} className="flex-shrink-0" />
          Film
        </span>
      )}
    </div>
  )
}

/* ── Winner card ─────────────────────────────────────────────────────────── */

const WinnerCard: React.FC<{
  winner: { rank: number; artwork: ResultArtwork }
  isLead: boolean
  onOpen: (artwork: ResultArtwork) => void
}> = ({ winner, isLead, onOpen }) => {
  const meta = rankMeta(winner.rank)
  const { artwork } = winner
  const hasMedia = Boolean(artwork.thumbnailUrl || artwork.imageUrl || artwork.videoUrl)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => hasMedia && onOpen(artwork)}
      className={`group relative h-full bg-black/40 border overflow-hidden flex flex-col ${
        isLead ? 'md:flex-row' : ''
      } ${hasMedia ? 'cursor-pointer' : ''}`}
      style={{
        borderColor: isLead ? `${meta.accent}59` : `${meta.accent}26`,
        boxShadow: isLead ? `0 0 40px -18px ${meta.glow}` : undefined,
      }}
    >
      {/* Media — full width on mobile, left half of the lead card from md */}
      {hasMedia && (
        <div className={`flex-shrink-0 ${isLead ? 'md:w-[52%]' : ''}`}>
          <WinnerMedia artwork={artwork} accent={meta.accent} numeral={meta.numeral} />
        </div>
      )}

      {/* Details */}
      <div className="relative flex-1 p-5 sm:p-6 md:p-7 flex flex-col justify-center">
        {/* Oversized ghost numeral — decorative only */}
        <span
          aria-hidden="true"
          className="editorial-text absolute -bottom-4 right-3 sm:right-4 text-6xl sm:text-7xl md:text-8xl font-light leading-none pointer-events-none select-none opacity-[0.07]"
          style={{ color: meta.accent }}
        >
          {meta.numeral}
        </span>

        <div className="relative z-10">
          {/* Rank badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span
              className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border font-mono text-[10px] sm:text-xs font-bold"
              style={{
                color: meta.accent,
                borderColor: `${meta.accent}66`,
                backgroundColor: `${meta.accent}14`,
              }}
            >
              0{winner.rank}
            </span>
            <span
              className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em]"
              style={{ color: meta.accent }}
            >
              {meta.label}
            </span>
          </div>

          {/* Artwork title */}
          <h4
            className={`editorial-text mt-4 font-light text-exhibition-bone leading-snug break-words ${
              isLead ? 'text-2xl sm:text-3xl md:text-[2.25rem]' : 'text-xl sm:text-2xl'
            }`}
          >
            {artwork.title}
          </h4>

          {/* Artist */}
          <div className="mt-3 flex items-center gap-2.5">
            <span className="h-px w-6 sm:w-8 flex-shrink-0" style={{ backgroundColor: `${meta.accent}80` }} />
            <span className="font-mono text-[11px] sm:text-xs text-zinc-300 uppercase tracking-[0.15em] break-words">
              {artwork.artist.name}
            </span>
          </div>

          {/* College — real detail off the artwork record */}
          {artwork.artist.college && (
            <p className="font-mono text-[10px] text-zinc-500 mt-1.5 pl-[calc(1.5rem+0.625rem)] sm:pl-[calc(2rem+0.625rem)] break-words">
              {artwork.artist.college}
            </p>
          )}

          {/* Artist statement — only the lead card has room for it on mobile */}
          {artwork.description && (
            <p
              className={`font-mono text-[11px] sm:text-xs text-zinc-400 leading-relaxed mt-4 ${
                isLead ? 'line-clamp-3' : 'hidden sm:block line-clamp-2'
              }`}
            >
              {artwork.description}
            </p>
          )}

          {hasMedia && (
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 mt-5 inline-block group-hover:text-exhibition-gold transition-colors">
              {artwork.videoUrl ? 'Tap to watch' : 'Tap to view'}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

/* ── Lightbox ────────────────────────────────────────────────────────────── */

const ResultLightbox: React.FC<{ artwork: ResultArtwork; onClose: () => void }> = ({ artwork, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl my-auto bg-[#0d0d0d] border border-exhibition-gold/30"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-9 h-9 flex items-center justify-center border border-exhibition-gold/25 bg-black/70 text-exhibition-gold hover:bg-exhibition-gold hover:text-exhibition-void transition-colors"
        >
          <X size={16} />
        </button>

        <div className="bg-black flex items-center justify-center max-h-[60vh] sm:max-h-[70vh] overflow-hidden">
          {artwork.videoUrl ? (
            <video
              src={artwork.videoUrl}
              poster={artwork.thumbnailUrl || artwork.imageUrl || undefined}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[60vh] sm:max-h-[70vh]"
            />
          ) : (
            <img
              src={artwork.imageUrl || artwork.thumbnailUrl || ''}
              alt={artwork.title}
              className="w-full max-h-[60vh] sm:max-h-[70vh] object-contain"
            />
          )}
        </div>

        <div className="p-5 sm:p-7 border-t border-zinc-900">
          <h3 className="editorial-text text-2xl sm:text-3xl font-light text-exhibition-bone break-words">
            {artwork.title}
          </h3>
          <p className="font-mono text-[11px] sm:text-xs text-exhibition-gold uppercase tracking-[0.2em] mt-2 break-words">
            {artwork.artist.name}
            {artwork.artist.college && <span className="text-zinc-500 normal-case tracking-normal"> · {artwork.artist.college}</span>}
          </p>
          {artwork.subcategory && (
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1.5">
              {artwork.subcategory}
            </p>
          )}
          {artwork.description && (
            <p className="font-mono text-[11px] sm:text-xs text-zinc-400 leading-relaxed mt-4 whitespace-pre-line">
              {artwork.description}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Section ─────────────────────────────────────────────────────────────── */

const ResultsSection: React.FC = () => {
  const { results, loading, error } = useResults()
  const [active, setActive] = useState<ResultArtwork | null>(null)

  const data = results.length > 0 ? results : (error || !loading ? FALLBACK_RESULTS : [])

  return (
    <section id="results" className="max-w-5xl mx-auto mb-28 sm:mb-32 md:mb-40 scroll-mt-24">
      {/* Section header */}
      <div className="text-center mb-10 sm:mb-14 md:mb-20">
        <span className="inline-flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-exhibition-gold uppercase tracking-[0.3em] border border-exhibition-gold/25 rounded-full px-3.5 py-1.5 mb-5">
          <Trophy size={12} className="flex-shrink-0" />
          Results Announced
        </span>
        <h2 className="editorial-text text-4xl sm:text-5xl md:text-6xl font-light text-exhibition-bone px-2">
          Hall of Honor
        </h2>
        <p className="font-mono text-[11px] sm:text-xs text-zinc-400 leading-relaxed max-w-md mx-auto mt-4 sm:mt-5 px-4">
          The votes are counted and the judges have spoken. Presenting the winning works of
          <span className="text-exhibition-bone"> Summer at Your Place</span>.
        </p>
      </div>

      {/* Loading skeleton — keeps layout height stable while results arrive */}
      {loading && data.length === 0 && (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-40 sm:h-48 bg-black/40 border border-exhibition-gold/10 animate-pulse" />
          ))}
        </div>
      )}

      {/* One block per category */}
      <div className="space-y-12 sm:space-y-16 md:space-y-20">
        {data.map(group => (
          <div key={group.category}>
            {/* Category label */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex-shrink-0">
                Room {group.room}
              </span>
              <h3 className="font-mono text-xs sm:text-sm font-bold text-exhibition-gold uppercase tracking-[0.2em] flex-shrink-0">
                {group.label}
              </h3>
              <span className="h-px flex-1 bg-exhibition-gold/15" />
            </div>

            {/* Podium — stacked on mobile, two columns from md */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {group.winners.map((winner, i) => {
                // First place always spans the row. A category with only two
                // winners lets its runner-up span too, so the grid never ends
                // on a lone half-width card.
                const isLead = i === 0
                const spansRow = isLead || group.winners.length === 2
                return (
                  <div key={winner.artwork.id} className={spansRow ? 'md:col-span-2' : ''}>
                    <WinnerCard winner={winner} isLead={isLead} onOpen={setActive} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p className="font-mono text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.2em] text-center mt-12 sm:mt-16 px-4 leading-relaxed">
        Scored 50% public vote · 50% judges' panel
      </p>

      <AnimatePresence>
        {active && <ResultLightbox artwork={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  )
}

export default ResultsSection
