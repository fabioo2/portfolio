import { useEffect, useRef, useState } from 'react'

type Bar = {
  label: string
  value: number
  highlight?: boolean
}

const DATA: Bar[] = [
  { label: 'Charts I built this week', value: 7 },
  { label: 'Charts that actually shipped', value: 5 },
  { label: 'Charts with smooth tooltips', value: 4 },
  { label: 'Charts with proper keyboard nav', value: 2 },
  { label: 'Charts screen readers actually understand', value: 1, highlight: true },
]

const MAX = Math.max(...DATA.map((d) => d.value))

// Feature detection: the canvas-draw-element flag exposes a new method on the
// 2D context. The exact name has shifted across Chromium prototypes; check both.
function detectFeature(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  return 'drawElement' in ctx || 'drawElementImage' in ctx
}

export default function HtmlInCanvasBarChart() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Run feature detection on mount
  useEffect(() => {
    setSupported(detectFeature())
  }, [])

  // When the canvas IS supported, paint the bars onto it. Without the flag,
  // this is a no-op — the bars are rendered as plain CSS-styled buttons.
  useEffect(() => {
    if (!supported || !canvasRef.current) return
    paintToCanvas(canvasRef.current)
  }, [supported, focusedIdx])

  // Announce focused bar to screen readers via live region
  useEffect(() => {
    if (focusedIdx === null || !liveRegionRef.current) return
    const d = DATA[focusedIdx]
    liveRegionRef.current.textContent = `${d.label}: ${d.value}`
  }, [focusedIdx])

  return (
    <div className="my-6 border border-border rounded-xl bg-card overflow-hidden">
      <FlagBanner supported={supported} />

      <div className="p-4 sm:p-6">
        {/* The chart. When the flag is on, the bars live inside a <canvas>
            with layoutsubtree; without the flag, the canvas is invisible/empty
            and the buttons render as plain HTML — same accessibility tree
            either way. */}
        <div className="relative">
          {supported && (
            <canvas
              ref={canvasRef}
              width={720}
              height={DATA.length * 56}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            />
          )}

          <ul className="relative space-y-2 list-none">
            {DATA.map((d, i) => (
              <li key={d.label}>
                <BarButton
                  data={d}
                  index={i}
                  onFocus={() => setFocusedIdx(i)}
                  onBlur={() => setFocusedIdx(null)}
                  paintingViaCanvas={!!supported}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Screen-reader live region. Announces the focused bar without
            stealing focus. */}
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
// PARTS
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
          The bars below are rendered to a <code className="font-mono">&lt;canvas&gt;</code>{' '}
          via{' '}
          <code className="font-mono">drawElement</code>; the buttons inside it stay
          in the accessibility tree.
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
        in Chrome Canary or Brave Stable, set it to <em>Enabled</em>, and restart.
        The chart below is rendered with plain HTML as a fallback — you can still
        tab through it to feel the keyboard navigation HTML-in-Canvas would
        preserve.
      </span>
    </div>
  )
}

function BarButton({
  data,
  index,
  onFocus,
  onBlur,
  paintingViaCanvas,
}: {
  data: Bar
  index: number
  onFocus: () => void
  onBlur: () => void
  paintingViaCanvas: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const widthPct = (data.value / MAX) * 100

  // When the canvas-draw-element flag is on, tag this button with the
  // layoutsubtree attribute so the browser includes it in the canvas hit-test
  // + accessibility flow. Set imperatively — TypeScript/JSX don't know the
  // attribute yet, and including it via spread would warn at runtime.
  useEffect(() => {
    if (!paintingViaCanvas || !ref.current) return
    ref.current.setAttribute('layoutsubtree', '')
    return () => ref.current?.removeAttribute('layoutsubtree')
  }, [paintingViaCanvas])

  return (
    <button
      ref={ref}
      type="button"
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onFocus}
      aria-label={`${data.label}: ${data.value}`}
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
          className={
            'absolute inset-y-0 left-0 transition-all duration-300 ' +
            (data.highlight
              ? 'bg-[hsl(var(--brand))] group-focus-visible:brightness-110'
              : 'bg-muted-foreground/30 group-focus-visible:bg-muted-foreground/40')
          }
          style={{ width: `${widthPct}%` }}
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

function Caption({ supported }: { supported: boolean | null }) {
  return (
    <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
      Tab/Shift+Tab to move between bars. The live region above announces the
      focused bar's label and value to assistive tech.{' '}
      {supported
        ? 'On your browser, the visual bars are painted to a <canvas> while the buttons inside it keep their place in the accessibility tree — that\'s the whole point of the spec.'
        : 'On a flag-enabled browser, the buttons below would be children of a <canvas> element with the layoutsubtree attribute, hit-tested and exposed to screen readers just like they are now.'}
    </p>
  )
}

// =============================================================================
// CANVAS PAINTING (only runs when the flag is detected)
// =============================================================================

function paintToCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const cssWidth = canvas.clientWidth || canvas.width
  const cssHeight = canvas.clientHeight || canvas.height

  // Use real CSS size; scale for HiDPI
  canvas.width = cssWidth * dpr
  canvas.height = cssHeight * dpr
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, cssWidth, cssHeight)

  // For each data point, paint a faint rectangle behind where the HTML bar
  // lives. The visual styling matches the CSS bars; the difference is that
  // we're now painting to canvas. In a real chart, this is where you'd draw
  // animated transitions, tooltips, hover effects — all on canvas, while the
  // accessibility tree still sees the HTML buttons via layoutsubtree.
  const rowHeight = cssHeight / DATA.length
  const labelWidth = Math.min(260, cssWidth * 0.35)
  const valueGap = 40

  DATA.forEach((d, i) => {
    const y = i * rowHeight + rowHeight / 2 - 14
    const barAreaX = labelWidth + 12
    const barAreaWidth = cssWidth - barAreaX - valueGap

    // Track
    ctx.fillStyle = 'rgba(120, 120, 120, 0.08)'
    ctx.fillRect(barAreaX, y, barAreaWidth, 28)

    // Bar fill
    const w = (d.value / MAX) * barAreaWidth
    ctx.fillStyle = d.highlight ? 'rgba(26, 58, 92, 0.85)' : 'rgba(120, 120, 120, 0.3)'
    ctx.fillRect(barAreaX, y, w, 28)
  })
}
