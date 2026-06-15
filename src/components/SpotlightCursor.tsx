import React, { useEffect, useRef } from 'react'

interface SpotlightCursorProps {
  active?: boolean;
}

const SpotlightCursor: React.FC<SpotlightCursorProps> = ({ active = true }) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const handleMouseMove = (e: MouseEvent) => {
      if (overlayRef.current) {
        const x = `${e.clientX}px`
        const y = `${e.clientY}px`
        overlayRef.current.style.setProperty('--x', x)
        overlayRef.current.style.setProperty('--y', y)
      }
    }

    // Set initial position to center
    if (overlayRef.current) {
      overlayRef.current.style.setProperty('--x', '50%')
      overlayRef.current.style.setProperty('--y', '50%')
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [active])

  if (!active) return null

  return <div ref={overlayRef} className="spotlight-overlay" />
}

export default SpotlightCursor
