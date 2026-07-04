import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface EventSettings {
  submissionsEnabled: boolean
  votingEnabled: boolean
}

// Safe defaults while the real settings are loading — event treated as
// wrapped up (no submissions) until we hear otherwise from the backend.
const DEFAULT_SETTINGS: EventSettings = {
  submissionsEnabled: false,
  votingEnabled: true,
}

/**
 * Fetches the global event settings (submissions/voting open or closed).
 * Used across LandingPage, SubmitPage and GalleryPage to show the
 * "event has ended" messaging and gate actions consistently.
 */
export function useEventSettings() {
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (!active) return
        setSettings({
          submissionsEnabled: Boolean(data.submissionsEnabled),
          votingEnabled: Boolean(data.votingEnabled),
        })
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { settings, loading }
}
