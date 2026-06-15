import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface ErrorToastProps {
  setShowErrorToast: (show: boolean) => void;
  errorMessage: string;
  title?: string;
}

export default function ErrorToast({
  setShowErrorToast,
  errorMessage,
  title = "Error"
}: ErrorToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 right-8 z-[1200] max-w-md"
    >
      <div className="bg-red-900/90 backdrop-blur-md border border-red-700 shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-700/50 flex items-center justify-center">
          <Heart size={20} className="text-red-300" />
        </div>
        <div className="flex-1">
          <h4 className="font-mono text-sm font-bold text-red-100 mb-1">{title}</h4>
          <p className="font-mono text-xs text-red-200">{errorMessage}</p>
        </div>
        <button
          onClick={() => setShowErrorToast(false)}
          className="text-red-300 hover:text-red-100 transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}
