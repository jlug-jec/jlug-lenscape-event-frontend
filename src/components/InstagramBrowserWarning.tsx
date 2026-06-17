import { useState } from 'react'
import { AlertTriangle, Copy, Check } from 'lucide-react'
import { isInstagramBrowser } from '../lib/browser-detection'

export default function InstagramBrowserWarning() {
  const isInstagram = isInstagramBrowser()
  const [copied, setCopied] = useState(false)

  if (!isInstagram) return null

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select a text node if clipboard API is blocked
      const el = document.createElement('textarea')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="w-full bg-amber-500/15 border border-amber-500/40 rounded-lg p-4 mb-6 flex gap-3 items-start">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-mono text-sm font-bold text-amber-300 uppercase tracking-wide mb-1">
          Open in External Browser
        </h3>
        <p className="font-mono text-[11px] text-amber-200/80 leading-relaxed mb-3">
          You're viewing this in Instagram's browser — Google sign-in won't work here. Copy the link and paste it in Chrome, Safari, or your phone's default browser.
        </p>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-mono text-[10px] uppercase tracking-widest transition-colors rounded"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
        <p className="font-mono text-[9px] text-amber-200/50 mt-2 leading-relaxed">
          Tip: On Instagram, tap the <span className="text-amber-300">⋯</span> menu → "Open in browser" if available.
        </p>
      </div>
    </div>
  )
}
