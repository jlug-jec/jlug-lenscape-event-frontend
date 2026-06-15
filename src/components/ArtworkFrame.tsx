import React from 'react'
import { Heart } from 'lucide-react'
import { Artwork } from '../types'
import { useApp } from '../context/AppContext';

interface ArtworkFrameProps {
  artwork: Artwork
  onClick?: () => void
  onVote?: (e: React.MouseEvent) => void
  isVoted?: boolean
  hideVoteButton?: boolean
  hideVoteCount?: boolean
}

// Format video duration from seconds to MM:SS
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Map orientation id → Tailwind aspect class
const ASPECT: Record<string, string> = {
  landscape:   'aspect-[3/2]',
  portrait:    'aspect-[2/3]',
  square:      'aspect-square',
  widescreen:  'aspect-video',
  vertical:    'aspect-[9/16]',
}

const ArtworkFrame: React.FC<ArtworkFrameProps> = ({
  artwork,
  onClick,
  onVote,
  isVoted = false,
  hideVoteButton = false,
  hideVoteCount = false,
}) => {
  // 1. ACCESS THE CURRENT LOGGED-IN USER FROM CONTEXT
  const { currentUser } = useApp()

  // 2. CHECK IF THE LOGGED-IN USER IS THE ADMIN
  const isAdmin = currentUser?.email.toLowerCase() === 'admin@jlug.club'

  const { title, artist, imageUrl, videoUrl, thumbnailUrl, videoDuration, votes, comments, category } = artwork
  const aspectClass = ASPECT[(artwork as any).orientation] || 'aspect-[4/3]'

  // Format category to readable text
  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
    : 'Art'

  // Check if this is a video artwork
  const isVideo = Boolean(videoUrl)
  
  // For video artworks, use thumbnailUrl or imageUrl as poster
  const displayImage = isVideo ? (thumbnailUrl || imageUrl) : imageUrl

  return (
    <div className="flex flex-col items-center justify-center w-full">

      {/* Frame Container — flexible sizing, natural aspect ratio */}
      <div
        onClick={onClick}
        className={`museum-frame cursor-pointer relative overflow-hidden group select-none bg-black w-full`}
      >
        {/* Visual highlight on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[45] pointer-events-none" />

        {/* The Media - Video or Image */}
        {isVideo ? (
          <div className="w-full h-auto bg-black relative z-[40]">
            {/* Video thumbnail with play button overlay */}
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt={title}
                  className="w-full h-auto block"
                  loading="lazy"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-[45] pointer-events-none">
                  <div className="w-16 h-16 bg-exhibition-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(201,168,76,0.4)]">
                    <svg className="w-8 h-8 text-exhibition-void ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge */}
                {videoDuration && (
                  <div className="absolute bottom-3 right-3 z-[45] px-2 py-1 bg-exhibition-void/90 backdrop-blur-sm text-[10px] font-mono text-exhibition-gold border border-exhibition-gold/30">
                    {formatDuration(videoDuration)}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-zinc-900">
                <div className="text-zinc-500 text-center">
                  <div className="w-20 h-20 mx-auto mb-3 border-2 border-zinc-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-exhibition-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider">Video Artwork</p>
                </div>
              </div>
            )}
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-105 relative z-[40]"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm">
            No media available
          </div>
        )}

        {/* Small subtle badge on frame corner */}
        <div className="absolute top-3 right-3 z-[45] px-2 py-0.5 bg-exhibition-void/80 text-[10px] uppercase tracking-widest text-exhibition-gold border border-exhibition-gold/30">
          {categoryLabel}
        </div>
      </div>

      {/* Placard / Museum Tag */}
      <div className="mt-4 px-4 py-3 bg-[#0d0d0d] border border-exhibition-gold/20 w-full text-center shadow-lg relative transition-all duration-300 hover:border-exhibition-gold/50">
        {/* Small screw heads in corners to look like a metal placard */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-exhibition-gold/40" />
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-exhibition-gold/40" />
        <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-exhibition-gold/40" />
        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-exhibition-gold/40" />

        <h3 className="editorial-text text-xl font-bold text-exhibition-bone tracking-wide">
          {title}
        </h3>
        <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
          {artist?.name || 'Unknown Artist'}
        </p>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
          {artist?.college || 'Institution'}
        </p>

        {/* Quick stats / Interaction bar */}
        <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-zinc-800 text-zinc-400 text-xs font-mono">
          {hideVoteButton ? (
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="opacity-50" />
              {/* 3. CONDITIONAL VOTE DISPLAY (STATIC VARIANT) */}
              {isAdmin && <span>{votes}</span>}
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onClick) onClick()
              }}
              className={`flex items-center gap-1.5 transition-colors hover:text-exhibition-gold`}
            >
              <Heart size={14} />
              {/* 4. CONDITIONAL VOTE DISPLAY (BUTTON VARIANT) */}
              {isAdmin && <span>{votes}</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArtworkFrame