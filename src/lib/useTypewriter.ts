import { useEffect, useState } from 'react'

const TYPE_SPEED = 70
const ERASE_SPEED = 35
const PAUSE_AFTER_TYPE = 3500
const PAUSE_AFTER_ERASE = 400

/**
 * Cycles through `phrases` with a typewriter effect.
 * Returns the currently visible substring.
 *
 * Respects `prefers-reduced-motion` — locks to the first phrase if set.
 */
export function useTypewriter(phrases: string[]): string {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reduced) {
      setText(phrases[0])
      return
    }

    const current = phrases[phraseIndex]

    // Finished typing — pause, then start deleting
    if (!isDeleting && text === current) {
      const id = window.setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE)
      return () => window.clearTimeout(id)
    }

    // Finished deleting — pause, then advance to next phrase
    if (isDeleting && text === '') {
      const id = window.setTimeout(() => {
        setIsDeleting(false)
        setPhraseIndex((i) => (i + 1) % phrases.length)
      }, PAUSE_AFTER_ERASE)
      return () => window.clearTimeout(id)
    }

    const delay = isDeleting ? ERASE_SPEED : TYPE_SPEED
    const id = window.setTimeout(() => {
      setText((t) => (isDeleting ? t.slice(0, -1) : current.slice(0, t.length + 1)))
    }, delay)
    return () => window.clearTimeout(id)
  }, [text, phraseIndex, isDeleting, phrases, reduced])

  return text
}
