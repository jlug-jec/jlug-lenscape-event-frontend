import React, { useEffect, useRef } from 'react'

interface ParticleFieldProps {
  color?: string // Hex or rgba color
  count?: number
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  fadeSpeed: number
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  color = 'rgba(201, 168, 76, 0.4)', // Amber/Gold color
  count = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -Math.random() * 0.4 - 0.1, // Drifting upwards
          opacity: Math.random() * 0.8 + 0.2,
          fadeSpeed: Math.random() * 0.005 + 0.002,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = color

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color.replace(/[\d.]+\)$/g, `${p.opacity})`)
        ctx.fill()

        // Move particle
        p.x += p.speedX
        p.y += p.speedY

        // Slow fade in/out
        if (p.opacity <= 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.opacity = Math.random() * 0.8 + 0.2
        } else {
          // Fade as it nears the top
          if (p.y < 100) {
            p.opacity -= 0.01
          }
        }

        // Reset if it goes off screen
        if (p.y < -10) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.opacity = Math.random() * 0.8 + 0.2
        }
        if (p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, count])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full block"
    />
  )
}

export default ParticleField
