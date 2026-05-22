import { useEffect, useState } from 'react'
import { labEntries } from '@/data/lab'

const STORAGE_KEY = 'lastSeenLabPost'
const SEEN_EVENT = 'lab:seen'

export function getLatestLabEntry() {
  return [...labEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
}

/**
 * Mark the current latest lab post as seen. Call on any Lab route mount.
 */
export function markLabSeen() {
  const latest = getLatestLabEntry()
  if (!latest) return
  try {
    if (localStorage.getItem(STORAGE_KEY) !== latest.slug) {
      localStorage.setItem(STORAGE_KEY, latest.slug)
      window.dispatchEvent(new Event(SEEN_EVENT))
    }
  } catch {
    // localStorage disabled — nothing to do
  }
}

/**
 * Returns true when there's a lab post newer than what this user has seen.
 * The Navbar uses this to decide whether to show the bouncing red dot.
 */
export function useHasUnreadLabPost(): boolean {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const check = () => {
      const latest = getLatestLabEntry()
      if (!latest) {
        setHasUnread(false)
        return
      }
      try {
        const seen = localStorage.getItem(STORAGE_KEY)
        setHasUnread(seen !== latest.slug)
      } catch {
        // localStorage disabled — show the dot once per page load
        setHasUnread(true)
      }
    }
    check()
    window.addEventListener(SEEN_EVENT, check)
    return () => window.removeEventListener(SEEN_EVENT, check)
  }, [])

  return hasUnread
}
