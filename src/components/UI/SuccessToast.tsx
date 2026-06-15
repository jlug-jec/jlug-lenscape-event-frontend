import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface SuccessToastProps {
  setShowSuccessToast: (show: boolean) => void;
}

export default function SuccessToast({
  setShowSuccessToast
}: SuccessToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 right-8 z-[1200] max-w-md"
    >
      <div className="bg-green-900/90 backdrop-blur-md border border-green-700 shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-700/50 flex items-center justify-center">
          <Heart size={20} className="text-green-300 fill-green-300" />
        </div>
        <div className="flex-1">
          <h4 className="font-mono text-sm font-bold text-green-100 mb-1">Vote Cast Successfully!</h4>
          <p className="font-mono text-xs text-green-200">Your vote has been recorded. Thank you for participating!</p>
        </div>
        <button
          onClick={() => setShowSuccessToast(false)}
          className="text-green-300 hover:text-green-100 transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}
