import { useCallback, useEffect, useRef, useState } from 'react'

type Bar = {
  label: string
  value: number
  color: string
}

// Super Bowl wins by NFC East franchise, sorted by total. Each bar uses the
// team's primary jersey color.
const DATA: Bar[] = [
  { label: 'Dallas Cowboys', value: 5, color: '#003594' },
  { label: 'New York Giants', value: 4, color: '#0B2265' },
  { label: 'Washington Commanders', value: 3, color: '#5A1414' },
  { label: 'Philadelphia Eagles', value: 2, color: '#004C54' },
]

const MAX = Math.max(...DATA.map((d) => d.value))

// Feature detection: the canvas-draw-element flag exposes new context methods.
// The spec uses both names across Chromium prototypes — check both.
function detectFeature(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D & {
    drawElement?: unknown
    drawElementImage?: unknown
  } | null
  if (!ctx) return false
  return typeof ctx.drawElement === 'function' || typeof ctx.drawElementImage === 'function'
}

export default function HtmlInCanvasBarChart() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSupported(detectFeature())
  }, [])

  // Announce focused bar to assistive tech via the live region
  useEffect(() => {
    if (focusedIdx === null || !liveRegionRef.current) return
    const d = DATA[focusedIdx]
    liveRegionRef.current.textContent = `${d.label}: ${d.value} Super Bowl ${
      d.value === 1 ? 'win' : 'wins'
    }`
  }, [focusedIdx])

  const handleFocus = useCallback((i: number) => setFocusedIdx(i), [])
  const handleBlur = useCallback(() => setFocusedIdx(null), [])

  return (
    <div className="my-6 border border-border rounded-xl bg-card overflow-hidden">
      <FlagBanner supported={supported} />

      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="font-serif text-lg font-medium">
            Super Bowl Wins · NFC East
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bars colored by each franchise's primary jersey color.
          </p>
        </div>

        {supported === null ? (
          <p className="text-xs font-mono text-muted-foreground">Detecting browser support…</p>
        ) : (
          <ChartShell
            supported={supported}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}

        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        <Caption supported={supported} />
      </div>
    </div>
  )
}

// =============================================================================
// CHART SHELL — picks DOM structure based on feature support
// =============================================================================

function ChartShell({
  supported,
  onFocus,
  onBlur,
}: {
  supported: boolean
  onFocus: (i: number) => void
  onBlur: () => void
}) {
  const bars = DATA.map((d, i) => (
    <BarButton
      key={d.label}
      data={d}
      index={i}
      onFocus={() => onFocus(i)}
      onBlur={onBlur}
      inCanvas={supported}
    />
  ))

  if (supported) {
    // Real canvas-draw-element usage: <button> children of <canvas>, each
    // with the layoutsubtree attribute. The browser lays them out, hit-tests
    // them, and includes them in the accessibility tree — even though they
    // live inside a canvas element.
    return (
      <canvas
        role="list"
        aria-label="Super Bowl wins by NFC East franchise"
        className="block w-full"
        style={{ width: '100%', height: 'auto' }}
      >
        {bars}
      </canvas>
    )
  }

  // Fallback: identical buttons in a plain list. No canvas because layoutsubtree
  // would just turn the children into invisible canvas fallback content.
  return (
    <ul
      role="list"
      aria-label="Super Bowl wins by NFC East franchise"
      className="list-none space-y-2"
    >
      {bars.map((b, i) => (
        <li key={DATA[i].label}>{b}</li>
      ))}
    </ul>
  )
}

// =============================================================================
// BAR BUTTON — same component in both code paths
// =============================================================================

function BarButton({
  data,
  index,
  onFocus,
  onBlur,
  inCanvas,
}: {
  data: Bar
  index: number
  onFocus: () => void
  onBlur: () => void
  inCanvas: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const widthPct = (data.value / MAX) * 100

  // When the flag is on and we render inside <canvas>, mark each button with
  // the layoutsubtree attribute (set imperatively — TS/JSX don't know the
  // attribute name yet, and a JSX `layoutsubtree` prop would warn at runtime).
  useEffect(() => {
    if (!inCanvas || !ref.current) return
    ref.current.setAttribute('layoutsubtree', '')
    return () => ref.current?.removeAttribute('layoutsubtree')
  }, [inCanvas])

  return (
    <button
      ref={ref}
      type="button"
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onFocus}
      role="listitem"
      aria-label={`${data.label}: ${data.value} Super Bowl ${data.value === 1 ? 'win' : 'wins'}`}
      aria-posinset={index + 1}
      aria-setsize={DATA.length}
      className="group w-full text-left flex items-center gap-3 sm:gap-4 px-2 sm:px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card hover:bg-muted/40 transition-colors"
    >
      <span className="flex-shrink-0 w-44 sm:w-64 text-sm leading-snug">
        {data.label}
      </span>
      <span
        className="relative flex-1 h-7 rounded-sm overflow-hidden bg-muted/60"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 transition-all duration-300 group-focus-visible:brightness-110"
          style={{ width: `${widthPct}%`, backgroundColor: data.color }}
        />
      </span>
      <span
        className="flex-shrink-0 w-8 text-right text-sm font-mono tabular-nums text-muted-foreground group-focus-visible:text-foreground"
        aria-hidden="true"
      >
        {data.value}
      </span>
    </button>
  )
}

// =============================================================================
// BANNER + CAPTION
// =============================================================================

function FlagBanner({ supported }: { supported: boolean | null }) {
  if (supported === null) {
    return (
      <div className="px-4 sm:px-6 py-3 bg-muted/50 border-b border-border text-xs font-mono text-muted-foreground">
        Detecting browser support…
      </div>
    )
  }

  if (supported) {
    return (
      <div className="px-4 sm:px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/30 text-xs">
        <strong className="font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          ✓ Flag enabled.
        </strong>{' '}
        <span className="text-foreground/80">
          The buttons below are real children of a{' '}
          <code className="font-mono">&lt;canvas&gt;</code> element, each carrying the{' '}
          <code className="font-mono">layoutsubtree</code> attribute. They render visibly{' '}
          <em>and</em> stay in the accessibility tree.
        </span>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 text-xs">
      <strong className="font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
        ✗ Flag not enabled.
      </strong>{' '}
      <span className="text-foreground/80">
        Open{' '}
        <code className="font-mono select-all">
          chrome://flags/#canvas-draw-element
        </code>{' '}
        in Chrome Canary or Brave Stable, set it to <em>Enabled</em>, and restart. The chart
        below is rendered in a plain <code className="font-mono">&lt;ul&gt;</code> as a
        fallback — try Tab/Shift+Tab to see how the keyboard navigation would feel.
      </span>
    </div>
  )
}

function Caption({ supported }: { supported: boolean | null }) {
  return (
    <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
      Tab/Shift+Tab to move between bars. The live region above announces the focused
      bar's label and value to assistive tech.{' '}
      {supported === true && (
        <>
          The wrapper element of the bar list is a literal{' '}
          <code className="font-mono">&lt;canvas&gt;</code> — view source to confirm.
        </>
      )}
      {supported === false && (
        <>
          Same component renders inside a <code className="font-mono">&lt;canvas&gt;</code>{' '}
          with <code className="font-mono">layoutsubtree</code> when the flag is on. Try it
          and the wrapper element will swap to a canvas without any other layout changes.
        </>
      )}
    </p>
  )
}
