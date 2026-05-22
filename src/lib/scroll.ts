/**
 * Scroll to an element by ID with smooth behavior.
 * Used instead of `href="#id"` because HashRouter would interpret the hash as a route.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 56 // offset for sticky navbar
  window.scrollTo({ top, behavior: 'smooth' })
}

export function scrollHandler(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToId(id)
  }
}
