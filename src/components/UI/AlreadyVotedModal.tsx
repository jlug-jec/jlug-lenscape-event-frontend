import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface AlreadyVotedModalProps {
  setShowAlreadyVotedWarning: (show: boolean) => void;
}

export default function AlreadyVotedModal({
  setShowAlreadyVotedWarning
}: AlreadyVotedModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowAlreadyVotedWarning(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#0d0d0d] border border-zinc-700 shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-600 flex items-center justify-center">
            <Heart size={28} className="text-zinc-500 fill-zinc-600" />
          </div>
        </div>

        {/* Title */}
        <h3 className="editorial-text text-2xl font-light text-zinc-300 text-center mb-3">
          Already Voted
        </h3>

        {/* Message */}
        <p className="text-sm text-zinc-400 font-mono text-center leading-relaxed mb-2">
          You have already cast your vote.
        </p>
        <p className="text-xs text-zinc-500 font-mono text-center leading-relaxed mb-8">
          Each user can only vote once across all artworks.
        </p>

        {/* Button */}
        <button
          onClick={() => setShowAlreadyVotedWarning(false)}
          className="w-full px-4 py-3 bg-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all"
        >
          Understood
        </button>
      </motion.div>
    </motion.div>
  )
}
