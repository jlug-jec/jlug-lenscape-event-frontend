import { useEffect, useRef } from 'react'

/**
 * Attaches a mousemove listener to track cursor position.
 * Sets CSS variables --spot-x and --spot-y on the element to create a dynamic spotlight.
 *
 * Usage:
 *   const ref = useSpotlight()
 *   <div ref={ref} className="spot-md"> ... </div>
 */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--spot-x', `${x}px`)
      el.style.setProperty('--spot-y', `${y}px`)
    }

    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return ref
}

/**
 * Bulk version — observes all elements matching a selector inside a container.
 * Updates --spot-x and --spot-y on mouse move for each element.
 *
 * Usage:
 *   useSpotlightAll('.spot-lg, .spot-md')
 */
export function useSpotlightAll(selector: string) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const targets = document.querySelectorAll<HTMLElement>(selector)
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.setProperty('--spot-x', `${x}px`)
        el.style.setProperty('--spot-y', `${y}px`)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [selector])
}
