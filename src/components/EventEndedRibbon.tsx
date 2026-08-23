import React from 'react'

/**
 * Announces that the event has ended.
 * - Mobile: a slim full-width bar pinned to the top of the viewport (acts as a header notice).
 * - Tablet/desktop: a diagonal "ribbon" hanging from the top-right corner.
 *   The clipping box and strip are sized generously so both ends of the strip
 *   fall outside the box — otherwise the strip's short edge shows up as a
 *   visible rectangular cut instead of tapering cleanly into the corner.
 */
const EventEndedRibbon: React.FC = () => {
  return (
    <>
      {/* Mobile: header bar */}
      <div className="md:hidden fixed top-0 left-0 w-full z-[960] bg-exhibition-gold text-exhibition-void px-4 py-2 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-none select-none">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          Event Ended
        </span>
        <span className="w-1 h-1 rounded-full bg-exhibition-void/50 flex-shrink-0" />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] opacity-80">
          Winners Announced
        </span>
      </div>

      {/* Tablet/desktop: corner ribbon */}
      <div className="hidden md:block fixed top-0 right-0 z-[960] w-80 h-80 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute top-16 -right-24 w-[440px] rotate-45 bg-exhibition-gold text-exhibition-void text-center py-2.5 shadow-[0_6px_28px_rgba(0,0,0,0.65)] border-y-2 border-exhibition-void/30"
        >
          <span className="block font-mono text-sm font-bold uppercase tracking-[0.2em]">
            Event Ended
          </span>
          <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.15em] mt-0.5 opacity-80">
            Winners Announced
          </span>
        </div>
      </div>
    </>
  )
}

export default EventEndedRibbon
