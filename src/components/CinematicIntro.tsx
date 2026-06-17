import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CinematicIntroProps {
  onComplete: () => void
  preloadUrls?: string[]
}

// Lightweight starfield — no regex, no arc, just fillRect + globalAlpha
const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    type Star = { x: number; y: number; r: number; vx: number; vy: number; a: number }
    const stars: Star[] = Array.from({ length: 55 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.08),
      a:  Math.random() * 0.55 + 0.15,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#C9A84C'
      for (const s of stars) {
        ctx.globalAlpha = s.a
        ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2)
        s.x += s.vx
        s.y += s.vy
        if (s.y < 120) s.a = Math.max(0, s.a - 0.008)
        if (s.y < -6 || s.a <= 0) { s.x = Math.random() * canvas.width; s.y = canvas.height + 6; s.a = Math.random() * 0.55 + 0.15 }
        if (s.x < -6 || s.x > canvas.width + 6) s.x = Math.random() * canvas.width
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    draw()
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, preloadUrls = [] }) => {
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter')

  // Lock body scroll while intro is visible
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Preload artwork images during intro
  useEffect(() => {
    preloadUrls.forEach(url => { const img = new Image(); img.src = url })
  }, []) // eslint-disable-line

  const handleEnter = () => {
    if (phase !== 'idle') return
    setPhase('exit')
    window.scrollTo(0, 0)
    setTimeout(onComplete, 1400)
  }

  return (
    <>
      {/* 
        Synchronous black backdrop — plain div, no animation, no JS needed.
        Rendered immediately on first paint so the page behind is never visible,
        even before React hydrates or framer-motion kicks in.
      */}
      {phase !== 'exit' && (
        <div className="fixed inset-0 z-[999] bg-[#050505]" aria-hidden />
      )}

      <AnimatePresence>
        {phase !== 'exit' ? (
          <motion.div
            key="intro"
            // Start fully opaque — never transparent, never lets background show through
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => { if (phase === 'enter') setPhase('idle') }}
            className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center select-none overflow-hidden"
          >
            <StarField />

            {/* Radial vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)' }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-4">
              {/* Logo — starts visible immediately, no opacity-0 flash */}
              <motion.h1
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.2, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-6xl md:text-8xl font-extrabold tracking-[0.2em] text-exhibition-bone uppercase px-4 sm:px-0"
                style={{ textShadow: '0 0 40px rgba(201,168,76,0.28)' }}
              >
                Lenscape
              </motion.h1>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
                className="w-16 h-px bg-exhibition-gold mx-auto my-6 origin-center"
              />

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1.3, duration: 1.0, ease: 'easeOut' }}
                className="text-base md:text-xl font-light tracking-wide text-zinc-400 font-mono mb-12"
              >
                Every frame tells a story.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.9, ease: 'easeOut' }}
              >
                <button
                  onClick={handleEnter}
                  disabled={phase !== 'idle'}
                  className="px-8 py-3 border border-exhibition-gold/40 text-exhibition-gold font-mono uppercase tracking-[0.25em] text-xs
                    hover:bg-exhibition-gold hover:text-exhibition-void hover:border-exhibition-gold
                    transition-all duration-500
                    shadow-[0_0_20px_rgba(201,168,76,0.05)] hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]
                    disabled:opacity-40 disabled:cursor-default"
                >
                  Enter the Exhibition
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Curtain fades out after user clicks Enter, revealing the 3D scene beneath */
          <motion.div
            key="curtain"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
            className="fixed inset-0 z-[999] bg-[#050505] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default CinematicIntro
