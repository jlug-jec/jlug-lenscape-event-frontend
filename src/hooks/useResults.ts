import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface ResultArtwork {
  id: string
  title: string
  description: string | null
  category: string
  subcategory: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  orientation: string | null
  artist: {
    name: string
    college: string
    avatar: string | null
  }
}

export interface ResultWinner {
  rank: number
  artwork: ResultArtwork
}

export interface ResultCategory {
  category: string
  label: string
  room: string
  winners: ResultWinner[]
}

/**
 * Fetches the announced results (final placements joined with live artwork
 * data) from the backend. Ranking lives server-side; everything shown on the
 * card — title, media, artist — comes straight from the artworks collection.
 */
export function useResults() {
  const [results, setResults] = useState<ResultCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetch(`${API}/api/results`)
      .then(r => {
        if (!r.ok) throw new Error(`Results request failed: ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (!active) return
        if (Array.isArray(data)) {
          setResults(data)
        } else {
          setError(true)
        }
      })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  return { results, loading, error }
}
