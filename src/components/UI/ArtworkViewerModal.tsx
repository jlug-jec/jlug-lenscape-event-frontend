import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Artwork } from '../../types'

interface ArtworkViewerModalProps {
  selectedArtwork: Artwork;
  setSelectedArtwork: (artwork: Artwork | null) => void;
  user: any;
  handleVoteClick: () => void;
  hasVoted: boolean;
  handleCommentSubmit: (e: React.FormEvent, artId: string) => void;
  commentContent: string;
  setCommentContent: (content: string) => void;
  hideVoteButton?: boolean;
}

export default function ArtworkViewerModal({
  selectedArtwork,
  setSelectedArtwork,
  user,
  handleVoteClick,
  hasVoted,
  handleCommentSubmit,
  commentContent,
  setCommentContent,
  hideVoteButton = false
}: ArtworkViewerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-[#000000]/98 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setSelectedArtwork(null)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl h-auto max-h-[90vh] md:h-[80vh] bg-[#0d0d0d] border border-exhibition-gold/30 shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Localized film grain for the modal */}
        <div className="film-grain" style={{ position: 'absolute', zIndex: 10 }} />
        {/* Close button */}
        <button
          onClick={() => setSelectedArtwork(null)}
          className="absolute top-4 right-4 z-50 w-10 h-10 border border-exhibition-gold/20 flex items-center justify-center hover:bg-exhibition-gold hover:text-exhibition-void text-exhibition-gold transition-colors font-mono"
        >
          ×
        </button>

        {/* Left Side: Art display */}
        <div className="w-full md:w-[65%] h-64 sm:h-80 md:h-full flex-shrink-0 bg-black flex items-center justify-center relative z-[20] p-6 border-b md:border-b-0 md:border-r border-zinc-900">
          {/* Top wash light */}
          <div className="absolute top-0 w-32 h-32 bg-exhibition-gold/10 blur-xl rounded-full" />
          
          {selectedArtwork.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              {/* Check if it's a Google Drive embed (legacy) or Cloudinary video (new) */}
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
                  className="w-full h-full max-h-full object-contain shadow-2xl border border-white/5"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : selectedArtwork.imageUrl ? (
            <img
              src={selectedArtwork.imageUrl}
              alt={selectedArtwork.title}
              className="max-w-full max-h-full object-contain shadow-2xl border border-white/5"
            />
          ) : (
            <div className="text-zinc-500 font-mono text-sm">Media Unavailable</div>
          )}
        </div>

        {/* Right Side: Information / Placard details & comments */}
        <div className="w-full md:w-[35%] h-auto md:h-full flex flex-col bg-[#0b0b0b] flex-grow">
          {/* Art Details */}
          <div className="p-6 border-b border-zinc-900">
            <span className="font-mono text-[9px] text-exhibition-gold uppercase tracking-[0.25em] block mb-1">
              {selectedArtwork.category.replace('-', ' ')}
              {selectedArtwork.subCategory && ` · ${selectedArtwork.subCategory.replace('-', ' ')}`}
            </span>
            <h3 className="editorial-text text-2xl md:text-3xl font-light text-exhibition-bone">
              {selectedArtwork.title}
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-2 uppercase tracking-wide">
              By {selectedArtwork.artist.name}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              {selectedArtwork.artist.college}
            </p>
            <p className="text-xs text-zinc-400 mt-4 font-mono font-light leading-relaxed max-h-24 overflow-y-auto pr-2">
              {selectedArtwork.description}
            </p>

            {/* Vote button */}
            <div className="flex items-center justify-end mt-6 pt-4 border-t border-zinc-900">
              {!hideVoteButton && (
                user ? (
                  <div className="relative group">
                    <button
                      onClick={handleVoteClick}
                      disabled={hasVoted}
                      className={`px-4 py-1.5 border font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        hasVoted
                          ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : 'border-exhibition-gold/40 hover:border-exhibition-gold text-exhibition-gold hover:bg-exhibition-gold/10'
                      }`}
                    >
                      <Heart size={12} className={hasVoted ? 'fill-zinc-600' : ''} />
                      <span>{hasVoted ? 'VOTED' : 'VOTE'}</span>
                    </button>
                    {hasVoted && (
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        You have already voted for {selectedArtwork.category.replace('-', ' ')}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/auth/signup" className="text-[10px] font-mono text-exhibition-gold hover:underline">
                    Sign up to vote
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Feedbacks / Comments section - HIDDEN (kept for future use) */}
          {false && selectedArtwork && (
            <>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 max-h-60 md:max-h-none">
                <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">
                  Feedbacks ({selectedArtwork?.comments?.length || 0})
                </h4>

                <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1">
                  {selectedArtwork?.comments?.length && selectedArtwork.comments.length > 0 ? (
                    selectedArtwork.comments.map((comment) => (
                      <div key={comment.id} className="text-xs font-mono bg-black/20 p-2.5 border border-zinc-900">
                        <div className="flex justify-between text-[10px] text-exhibition-gold mb-1">
                          <span>{comment.userName}</span>
                          <span className="text-zinc-600">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-300 font-sans">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs font-mono py-6">
                      No feedbacks logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit comments bar */}
              {user ? (
                <form
                  onSubmit={(e) => selectedArtwork && handleCommentSubmit(e, selectedArtwork.id)}
                  className="p-4 bg-black/40 border-t border-zinc-900 flex gap-2"
                >
                  <input
                    type="text"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a feedback..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-xs font-sans px-3 py-2 text-exhibition-bone focus:outline-none focus:border-exhibition-gold/50"
                  />
                  <button
                    type="submit"
                    disabled={!commentContent.trim()}
                    className="w-8 h-8 flex items-center justify-center bg-exhibition-gold text-exhibition-void hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={12} />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-black/40 border-t border-zinc-900 text-center text-[10px] font-mono text-zinc-600">
                  <Link to="/auth/login" className="text-exhibition-gold hover:underline">Log in</Link> to write a feedback.
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
