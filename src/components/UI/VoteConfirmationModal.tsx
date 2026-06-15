import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface VoteConfirmationModalProps {
  setShowVoteConfirmation: (show: boolean) => void;
  confirmVote: () => void;
}

export default function VoteConfirmationModal({
  setShowVoteConfirmation,
  confirmVote
}: VoteConfirmationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowVoteConfirmation(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#0d0d0d] border border-exhibition-gold/30 shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-exhibition-gold/40 flex items-center justify-center">
            <Heart size={28} className="text-exhibition-gold" />
          </div>
        </div>

        {/* Title */}
        <h3 className="editorial-text text-2xl font-light text-exhibition-bone text-center mb-3">
          Confirm Your Vote
        </h3>

        {/* Message */}
        <p className="text-sm text-zinc-400 font-mono text-center leading-relaxed mb-2">
          You can only vote <span className="text-exhibition-gold font-bold">once</span> per category.
        </p>
        <p className="text-xs text-zinc-500 font-mono text-center leading-relaxed mb-8">
          This action cannot be undone. Are you sure you want to cast your vote?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowVoteConfirmation(false)}
            className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-wider hover:border-zinc-500 hover:text-zinc-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={confirmVote}
            className="flex-1 px-4 py-3 bg-exhibition-gold text-exhibition-void font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all font-bold flex items-center justify-center gap-2"
          >
            <Heart size={14} className="fill-current" />
            Confirm Vote
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
