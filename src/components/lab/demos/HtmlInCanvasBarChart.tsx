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
  logo: string
}

const DATA: Bar[] = [
  {
    label: 'Dallas Cowboys',
    value: 5,
    color: '#003594',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  },
  {
    label: 'New York Giants',
    value: 4,
    color: '#0B2265',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  },
  {
    label: 'Washington Commanders',
    value: 3,
    color: '#5A1414',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
  },
  {
    label: 'Philadelphia Eagles',
    value: 2,
    color: '#004C54',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  },
]

const MAX = Math.max(...DATA.map((d) => d.value))

// The one hand-written string a legacy canvas chart exposes to assistive
// tech. Everything a screen reader knows about the chart is in here — and
// it drifts the moment someone edits the data and forgets this line.
const STUFFED_ARIA_LABEL =
  'Bar chart: Super Bowl wins by NFC East team. ' +
  DATA.map((d) => `${d.label} ${d.value}`).join(', ') +
  '.'

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
// SHARED HELPERS
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

  const bodyGrad = ctx.createLinearGradient(x, y, x, y + h)
  bodyGrad.addColorStop(0, rgbStr(top))
  bodyGrad.addColorStop(0.18, rgbStr(upper))
  bodyGrad.addColorStop(0.5, rgbStr(mid))
  bodyGrad.addColorStop(0.82, rgbStr(lower))
  bodyGrad.addColorStop(1, rgbStr(bottom))

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

  // Right end cap — half ellipse so the bar reads as a cylinder, not a rect.
  const capDepth = Math.max(3, h * 0.18)
  const capGrad = ctx.createLinearGradient(x + w, y, x + w, y + h)
  capGrad.addColorStop(0, rgbStr(shift(base, 60)))
  capGrad.addColorStop(0.5, rgbStr(shift(base, 10)))
  capGrad.addColorStop(1, rgbStr(shift(base, -55)))

  ctx.beginPath()
  ctx.ellipse(x + w, y + h / 2, capDepth, h / 2, 0, -Math.PI / 2, Math.PI / 2)
  ctx.fillStyle = capGrad
  ctx.fill()

  // Glossy highlight strip across the top
  const sheenGrad = ctx.createLinearGradient(x, y, x, y + h * 0.4)
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = sheenGrad
  ctx.fillRect(x + radius, y, w - radius, h * 0.4)
}

// Preload team logos as Image objects (for canvas-side painting).
function useLogoImages(): Record<string, HTMLImageElement> {
  const [imgs, setImgs] = useState<Record<string, HTMLImageElement>>({})
  useEffect(() => {
    let alive = true
    DATA.forEach((d) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (alive) setImgs((m) => ({ ...m, [d.label]: img }))
      }
      img.src = d.logo
    })
    return () => {
      alive = false
    }
  }, [])
  return imgs
}

// Track the site's manual dark-mode class so canvas text stays legible.
function useIsDark(): boolean {
  const [dark, setDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')))
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

// =============================================================================
// ROOT — detect support, pick the path
// =============================================================================

export default function HtmlInCanvasBarChart() {
  const [supported] = useState<boolean | null>(() => detectFeature())

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
          <p className="text-xs font-mono text-muted-foreground">
            Detecting browser support…
          </p>
        ) : supported ? (
          <AccessibleChart />
        ) : (
          <LegacyChart />
        )}
      </div>
    </div>
  )
}

// =============================================================================
// THE NEW WAY — real buttons, painted into canvas via drawElement()
// =============================================================================

function AccessibleChart() {
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRefs = useRef<Array<HTMLElement | null>>([])
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (focusedIdx === null || !liveRegionRef.current) return
    const d = DATA[focusedIdx]
    liveRegionRef.current.textContent = `${d.label}: ${d.value} Super Bowl ${
      d.value === 1 ? 'win' : 'wins'
    }`
  }, [focusedIdx])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const wrapperRect = wrapper.getBoundingClientRect()
    if (wrapperRect.width === 0 || wrapperRect.height === 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(wrapperRect.width * dpr)
    canvas.height = Math.round(wrapperRect.height * dpr)
    canvas.style.width = `${wrapperRect.width}px`
    canvas.style.height = `${wrapperRect.height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, wrapperRect.width, wrapperRect.height)

    DATA.forEach((d, i) => {
      const track = trackRefs.current[i]
      if (!track) return
      const r = track.getBoundingClientRect()
      const x = r.left - wrapperRect.left
      const y = r.top - wrapperRect.top
      const fillW = (d.value / MAX) * r.width
      drawCylinder(ctx, x, y, fillW, r.height, d.color, focusedIdx === i)
    })

    // drawElement() — the spec primitive. The focused team's <img> (the very
    // same node that's in the accessibility tree) is composited into the
    // canvas pixel buffer with a colored glow. Falls back to drawImage so
    // the flourish degrades gracefully.
    if (focusedIdx !== null) {
      const track = trackRefs.current[focusedIdx]
      const btn = buttonRefs.current[focusedIdx]
      const logo = btn?.querySelector('img') as HTMLImageElement | null
      if (track && logo) {
        const r = track.getBoundingClientRect()
        const fillW = (DATA[focusedIdx].value / MAX) * r.width
        const SIZE = 36
        const minCx = SIZE / 2 + 4
        const cxLocal = Math.max(minCx, fillW - 22)
        const cx = r.left - wrapperRect.left + cxLocal
        const cy = r.top - wrapperRect.top + r.height / 2

        ctx.save()
        ctx.shadowColor = DATA[focusedIdx].color
        ctx.shadowBlur = 14
        ctx.globalAlpha = 0.85
        ctx.translate(cx, cy)
        ctx.scale(SIZE / 24, SIZE / 24)
        ctx.translate(-12, -12)

        const ctxAny = ctx as CanvasRenderingContext2D & {
          drawElement?: (el: Element) => void
          drawElementImage?: (el: Element) => void
        }
        const spec = ctxAny.drawElement || ctxAny.drawElementImage
        try {
          if (typeof spec === 'function') {
            spec.call(ctxAny, logo)
          } else if (logo.complete && logo.naturalWidth > 0) {
            ctx.drawImage(logo, 0, 0, 24, 24)
          }
        } catch {
          if (logo.complete && logo.naturalWidth > 0) {
            ctx.drawImage(logo, 0, 0, 24, 24)
          }
        }
        ctx.restore()
      }
    }
  }, [focusedIdx])

  useLayoutEffect(() => {
    paint()
  }, [paint])

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(() => paint())
    obs.observe(wrapperRef.current)
    window.addEventListener('resize', paint)
    return () => {
      obs.disconnect()
      window.removeEventListener('resize', paint)
    }
  }, [paint])

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        />
        <ul
          role="list"
          aria-label="Super Bowl wins by NFC East franchise"
          className="list-none space-y-1 relative"
        >
          {DATA.map((d, i) => (
            <li key={d.label}>
              <BarButton
                data={d}
                index={i}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                btnRef={(el) => {
                  buttonRefs.current[i] = el
                }}
                trackRef={(el) => {
                  trackRefs.current[i] = el
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      <div ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      <div className="mt-4 p-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-xs leading-relaxed">
        <strong className="text-emerald-700 dark:text-emerald-400">
          The new way — one source of truth.
        </strong>{' '}
        <span className="text-foreground/80">
          Each row is a real <code className="font-mono">&lt;button&gt;</code>: Tab
          through them, and a screen reader reads each team and win count. The same
          element is also composited into the canvas via{' '}
          <code className="font-mono">drawElement()</code> on focus. The thing you
          see and the thing assistive tech hears are <em>the same node</em> — nothing
          to keep in sync, nothing to drift.
        </span>
      </div>
    </>
  )
}

function BarButton({
  data,
  index,
  onFocus,
  onBlur,
  btnRef,
  trackRef,
}: {
  data: Bar
  index: number
  onFocus: () => void
  onBlur: () => void
  btnRef: (el: HTMLButtonElement | null) => void
  trackRef: (el: HTMLElement | null) => void
}) {
  return (
    <button
      ref={btnRef}
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
          src={data.logo}
          alt={`${data.label} logo`}
          width="24"
          height="24"
          crossOrigin="anonymous"
          className="flex-shrink-0"
        />
        <span>{data.label}</span>
      </span>
      <span
        ref={trackRef}
        className="relative flex-1 h-8 rounded-sm overflow-hidden"
        aria-hidden="true"
      />
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
// THE OLD WAY — one opaque canvas + a single hand-written aria-label
// =============================================================================

const ROW_H = 40
const ROW_GAP = 6

function LegacyChart() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logos = useLogoImages()
  const dark = useIsDark()
  const [width, setWidth] = useState(640)

  const height = DATA.length * ROW_H + (DATA.length - 1) * ROW_GAP

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const labelW = width < 460 ? 140 : 220
    const valueW = 26
    const trackLeft = labelW + 8
    const trackW = Math.max(20, width - trackLeft - valueW - 6)

    const nameColor = dark ? 'rgba(245,240,235,0.92)' : 'rgba(20,22,28,0.9)'
    const valueColor = dark ? 'rgba(245,240,235,0.6)' : 'rgba(20,22,28,0.55)'

    DATA.forEach((d, i) => {
      const rowY = i * (ROW_H + ROW_GAP)
      const cy = rowY + ROW_H / 2

      // logo
      const img = logos[d.label]
      if (img) {
        ctx.drawImage(img, 4, cy - 11, 22, 22)
      }

      // team name
      ctx.fillStyle = nameColor
      ctx.font =
        '14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.fillText(d.label, 34, cy)

      // cylinder
      const fillW = (d.value / MAX) * trackW
      drawCylinder(ctx, trackLeft, rowY + 6, fillW, ROW_H - 12, d.color, false)

      // value
      ctx.fillStyle = valueColor
      ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(String(d.value), width - 4, cy)
    })
  }, [width, height, logos, dark])

  useLayoutEffect(() => {
    paint()
  }, [paint])

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width))
    })
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <div ref={wrapperRef} className="w-full">
        {/* The entire chart is ONE canvas. A screen reader gets a single
            string and nothing else — no per-bar structure, no focus, no
            keyboard nav. */}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={STUFFED_ARIA_LABEL}
        />
      </div>

      <div className="mt-4 p-3 rounded-md bg-amber-500/5 border border-amber-500/20 text-xs leading-relaxed">
        <strong className="text-amber-700 dark:text-amber-400">
          The old way — bolt-on accessibility.
        </strong>{' '}
        <span className="text-foreground/80">
          The whole chart above is one opaque <code className="font-mono">&lt;canvas&gt;</code>.
          You can't Tab into it; there are no per-bar elements. The <em>only</em> thing
          assistive tech receives is a single string you write by hand:
        </span>
        <code className="mt-2 block p-2 rounded bg-muted/60 font-mono text-[11px] text-foreground/70 whitespace-pre-wrap">
          aria-label="{STUFFED_ARIA_LABEL}"
        </code>
        <span className="text-foreground/80 mt-2 block">
          Edit the data and forget to update that line, and the screen-reader version
          silently drifts from what's on screen. This is what almost every canvas
          charting library ships today.{' '}
          <strong>Enable the flag to see the same chart done the new way.</strong>
        </span>
      </div>
    </>
  )
}

// =============================================================================
// BANNER
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
          ✓ Flag enabled — the new way.
        </strong>{' '}
        <span className="text-foreground/80">
          The chart below is built from real HTML <code className="font-mono">&lt;button&gt;</code>s
          that are <em>also</em> painted into the canvas via{' '}
          <code className="font-mono">drawElement()</code>. Tab through it.
        </span>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 text-xs">
      <strong className="font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
        ✗ Flag not enabled — the old way.
      </strong>{' '}
      <span className="text-foreground/80">
        Below is how canvas charts work today: one opaque{' '}
        <code className="font-mono">&lt;canvas&gt;</code> with a single bolted-on
        label. To see the accessible version, open{' '}
        <code className="font-mono select-all">chrome://flags/#canvas-draw-element</code>{' '}
        in Chrome Canary or Brave Stable and restart.
      </span>
    </div>
  )
}
