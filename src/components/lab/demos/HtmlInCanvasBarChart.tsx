import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type Bar = {
  label: string
  value: number
  color: string
  shape: string // inner SVG markup drawn on top of a colored circle
}

// Generic geometric marks — not the teams' real logos. Star (Cowboys),
// skyline (Giants), shield (Washington), chevron/wing (Eagles).
const STAR =
  '<polygon points="16,5 19,13 27,13 21,19 23,26 16,21 9,26 11,19 5,13 13,13" fill="white"/>'
const SKYLINE =
  '<rect x="9" y="14" width="4" height="13" fill="white"/>' +
  '<rect x="14" y="9" width="4" height="18" fill="white"/>' +
  '<rect x="19" y="12" width="4" height="15" fill="white"/>'
const SHIELD =
  '<path d="M16 7 L23 9 L23 17 Q23 22 16 26 Q9 22 9 17 L9 9 Z" fill="white"/>'
const CHEVRON = '<path d="M7 11 L16 22 L25 11 Z" fill="white"/>'

// Super Bowl wins by NFC East franchise, sorted by total. Each bar uses the
// team's primary jersey color and a custom geometric mark with proper alt text.
const DATA: Bar[] = [
  { label: 'Dallas Cowboys', value: 5, color: '#003594', shape: STAR },
  { label: 'New York Giants', value: 4, color: '#0B2265', shape: SKYLINE },
  { label: 'Washington Commanders', value: 3, color: '#5A1414', shape: SHIELD },
  { label: 'Philadelphia Eagles', value: 2, color: '#004C54', shape: CHEVRON },
]

const MAX = Math.max(...DATA.map((d) => d.value))

// Build the team's mark as a data: URL so it ships zero external assets.
// Using a real <img alt="…"> means screen readers announce it via standard
// HTML semantics — demonstrating that putting elements inside <canvas> via
// layoutsubtree preserves your existing accessibility patterns (no special
// canvas a11y plumbing needed).
function teamLogoDataUrl(shape: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<circle cx="16" cy="16" r="15" fill="${color}"/>` +
    shape +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Feature detection: the canvas-draw-element flag exposes new context methods.
// The spec uses both names across Chromium prototypes — check both.
function detectFeature(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as
    | (CanvasRenderingContext2D & {
        drawElement?: unknown
        drawElementImage?: unknown
      })
    | null
  if (!ctx) return false
  return typeof ctx.drawElement === 'function' || typeof ctx.drawElementImage === 'function'
}

// =============================================================================
// CYLINDER PAINTING
// =============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '')
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ]
}

function shift(rgb: [number, number, number], amt: number): [number, number, number] {
  return [
    Math.max(0, Math.min(255, rgb[0] + amt)),
    Math.max(0, Math.min(255, rgb[1] + amt)),
    Math.max(0, Math.min(255, rgb[2] + amt)),
  ]
}

function rgbStr([r, g, b]: [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`
}

function drawCylinder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  focused: boolean,
) {
  if (w <= 0) return

  const base = hexToRgb(color)
  const boost = focused ? 18 : 0
  const top = shift(base, 90 + boost)
  const upper = shift(base, 40 + boost)
  const mid = shift(base, boost)
  const lower = shift(base, -45)
  const bottom = shift(base, -80)

  // Body: vertical gradient gives the round-cylinder look (highlight near top,
  // shadow toward bottom).
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + h)
  bodyGrad.addColorStop(0, rgbStr(top))
  bodyGrad.addColorStop(0.18, rgbStr(upper))
  bodyGrad.addColorStop(0.5, rgbStr(mid))
  bodyGrad.addColorStop(0.82, rgbStr(lower))
  bodyGrad.addColorStop(1, rgbStr(bottom))

  // Slightly rounded left edge so the cylinder doesn't look chopped at the
  // y-axis. Draw the body with a rounded-rect path.
  const radius = Math.min(h / 2, 4)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Right end cap — half ellipse on the right side, slightly brighter
  // gradient to suggest the curved surface catching light.
  const capDepth = Math.max(3, h * 0.18)
  const capGrad = ctx.createLinearGradient(x + w, y, x + w, y + h)
  capGrad.addColorStop(0, rgbStr(shift(base, 60)))
  capGrad.addColorStop(0.5, rgbStr(shift(base, 10)))
  capGrad.addColorStop(1, rgbStr(shift(base, -55)))

  ctx.beginPath()
  ctx.ellipse(x + w, y + h / 2, capDepth, h / 2, 0, -Math.PI / 2, Math.PI / 2)
  ctx.fillStyle = capGrad
  ctx.fill()

  // Very faint highlight band along the top — gives the cylinder a glossy
  // reflection beat.
  const sheenGrad = ctx.createLinearGradient(x, y, x, y + h * 0.4)
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)')
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = sheenGrad
  ctx.fillRect(x + radius, y, w - radius, h * 0.4)
}

// =============================================================================
// COMPONENT
// =============================================================================

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
            focusedIdx={focusedIdx}
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
  focusedIdx,
  onFocus,
  onBlur,
}: {
  supported: boolean
  focusedIdx: number | null
  onFocus: (i: number) => void
  onBlur: () => void
}) {
  // Even if the flag is detected, the layoutsubtree implementation may not
  // actually render the buttons. Render inside <canvas> first, then verify
  // after mount — if buttons didn't lay out, swap to the <ul> fallback so
  // the chart isn't empty.
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRefs = useRef<Array<HTMLElement | null>>([])
  const [renderedOk, setRenderedOk] = useState(true)

  useEffect(() => {
    if (!supported || !containerRef.current) return
    const id = requestAnimationFrame(() => {
      const firstBtn = containerRef.current?.querySelector('button')
      const visible = !!firstBtn && firstBtn.offsetHeight > 0
      setRenderedOk(visible)
    })
    return () => cancelAnimationFrame(id)
  }, [supported])

  const useCanvasPath = supported && renderedOk

  // Paint 3D cylinders to the canvas, one per bar, at the position of each
  // button's bar-track element. The HTML buttons render visibly on top via
  // layoutsubtree, but with transparent track backgrounds — so the painted
  // cylinders show through.
  //
  // When a bar is focused, ALSO paint its team logo via drawElement() — the
  // same <img> element that's in the accessibility tree, rendered as canvas
  // pixels at an enlarged transform. This is the flag's flagship primitive.
  const paint = useCallback(() => {
    if (!useCanvasPath || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasRect = canvas.getBoundingClientRect()
    if (canvasRect.width === 0 || canvasRect.height === 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(canvasRect.width * dpr)
    canvas.height = Math.round(canvasRect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height)

    DATA.forEach((d, i) => {
      const track = trackRefs.current[i]
      if (!track) return
      const r = track.getBoundingClientRect()
      const x = r.left - canvasRect.left
      const y = r.top - canvasRect.top
      const fillW = (d.value / MAX) * r.width
      drawCylinder(ctx, x, y, fillW, r.height, d.color, focusedIdx === i)
    })

    // === drawElement() spec showcase ===
    // The focused bar's <img> gets painted into the canvas at 2.5× scale
    // with a soft glow. It's still the same HTML element that screen
    // readers see via the original alt text — the canvas just gets a
    // visual flourish that lives only in the painted layer.
    if (focusedIdx !== null) {
      const track = trackRefs.current[focusedIdx]
      const btn = track?.closest('button')
      const logo = btn?.querySelector('img') as HTMLImageElement | null
      if (track && logo) {
        const r = track.getBoundingClientRect()
        const fillW = (DATA[focusedIdx].value / MAX) * r.width
        const cx = r.left - canvasRect.left + fillW + 18
        const cy = r.top - canvasRect.top + r.height / 2

        const ctxAny = ctx as CanvasRenderingContext2D & {
          drawElement?: (el: Element) => void
          drawElementImage?: (el: Element) => void
        }
        const draw = ctxAny.drawElement || ctxAny.drawElementImage
        if (typeof draw === 'function') {
          ctx.save()
          // Soft glow behind the painted logo
          ctx.shadowColor = DATA[focusedIdx].color
          ctx.shadowBlur = 16
          ctx.globalAlpha = 0.7
          ctx.translate(cx, cy)
          ctx.scale(2.5, 2.5)
          // Re-center the 24×24 image around its midpoint
          ctx.translate(-12, -12)
          try {
            draw.call(ctxAny, logo)
          } catch {
            // Experimental API — if the call shape doesn't match this
            // Chromium build, silently skip rather than crash the chart.
          }
          ctx.restore()
        }
      }
    }
  }, [useCanvasPath, focusedIdx])

  // Initial paint + repaint on layout/state changes
  useLayoutEffect(() => {
    if (useCanvasPath) paint()
  }, [useCanvasPath, paint])

  // Repaint on resize
  useEffect(() => {
    if (!useCanvasPath || !canvasRef.current) return
    const obs = new ResizeObserver(() => paint())
    obs.observe(canvasRef.current)
    window.addEventListener('resize', paint)
    return () => {
      obs.disconnect()
      window.removeEventListener('resize', paint)
    }
  }, [useCanvasPath, paint])

  const bars = DATA.map((d, i) => (
    <BarButton
      key={d.label}
      data={d}
      index={i}
      onFocus={() => onFocus(i)}
      onBlur={onBlur}
      inCanvas={useCanvasPath}
      trackRef={(el) => {
        trackRefs.current[i] = el
      }}
    />
  ))

  return (
    <div ref={containerRef}>
      {useCanvasPath ? (
        <canvas
          ref={canvasRef}
          role="list"
          aria-label="Super Bowl wins by NFC East franchise"
          className="block w-full"
          style={{
            width: '100%',
            // <canvas> defaults to 150px intrinsic height — too short for our
            // bars and clips painted pixels. Size to fit all bars (each ~44px
            // tall with vertical padding) so layoutsubtree children have room
            // to lay out and the painted cylinders aren't clipped.
            height: `${DATA.length * 48}px`,
          }}
        >
          {bars}
        </canvas>
      ) : (
        <ul
          role="list"
          aria-label="Super Bowl wins by NFC East franchise"
          className="list-none space-y-2"
        >
          {bars.map((b, i) => (
            <li key={DATA[i].label}>{b}</li>
          ))}
        </ul>
      )}
    </div>
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
  trackRef,
}: {
  data: Bar
  index: number
  onFocus: () => void
  onBlur: () => void
  inCanvas: boolean
  trackRef: (el: HTMLElement | null) => void
}) {
  const widthPct = (data.value / MAX) * 100

  // Set layoutsubtree synchronously via ref callback so the attribute is on
  // the element when the canvas first lays out — otherwise the browser
  // treats the buttons as canvas fallback content (invisible).
  const setBtnRef = (el: HTMLButtonElement | null) => {
    if (!el) return
    if (inCanvas) el.setAttribute('layoutsubtree', '')
    else el.removeAttribute('layoutsubtree')
  }

  return (
    <button
      ref={setBtnRef}
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
      <span className="flex-shrink-0 w-44 sm:w-64 text-sm leading-snug flex items-center gap-2">
        <img
          src={teamLogoDataUrl(data.shape, data.color)}
          alt={`${data.label} logo`}
          width="24"
          height="24"
          className="flex-shrink-0"
        />
        <span>{data.label}</span>
      </span>
      <span
        ref={trackRef}
        className="relative flex-1 h-7 rounded-sm overflow-hidden"
        style={{ background: inCanvas ? 'transparent' : undefined }}
        aria-hidden="true"
      >
        {inCanvas ? null : (
          <>
            <span
              className="absolute inset-0 bg-muted/60"
              aria-hidden="true"
            />
            <span
              className="absolute inset-y-0 left-0 transition-all duration-300 group-focus-visible:brightness-110"
              style={{ width: `${widthPct}%`, backgroundColor: data.color }}
            />
          </>
        )}
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
          Buttons sit inside <code className="font-mono">&lt;canvas&gt;</code> via{' '}
          <code className="font-mono">layoutsubtree</code>. The 3D cylinders are
          painted to the canvas 2D context. <strong>Focus a bar</strong> and its
          team logo also gets painted via{' '}
          <code className="font-mono">drawElement()</code> — the same{' '}
          <code className="font-mono">&lt;img&gt;</code> that's in the a11y tree,
          re-rendered as canvas pixels with a glow.
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
        below is rendered with flat CSS bars as a fallback — tab through it to feel the
        keyboard navigation.
      </span>
    </div>
  )
}

function Caption({ supported }: { supported: boolean | null }) {
  return (
    <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
      Tab/Shift+Tab to move between bars. The live region above announces the focused
      bar's label and value to assistive tech. The team marks use standard{' '}
      <code className="font-mono">&lt;img alt&quot;…&quot;&gt;</code> markup — native
      HTML accessibility patterns work as-is alongside the canvas spec.{' '}
      {supported === true && (
        <>
          The bars are painted as 3D cylinders to the canvas's 2D context, the
          buttons render on top via <code className="font-mono">layoutsubtree</code>,
          and the focused team's logo is also painted via{' '}
          <code className="font-mono">drawElement()</code> — all three spec
          primitives in one demo.
        </>
      )}
      {supported === false && (
        <>
          With the flag on, the same buttons sit inside a{' '}
          <code className="font-mono">&lt;canvas&gt;</code> with{' '}
          <code className="font-mono">layoutsubtree</code> and the bars are painted as
          3D cylinders to its 2D context.
        </>
      )}
    </p>
  )
}
