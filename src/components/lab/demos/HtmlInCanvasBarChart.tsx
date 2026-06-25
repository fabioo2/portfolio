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

// =============================================================================
// COMPONENT
// =============================================================================

export default function HtmlInCanvasBarChart() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)

  // Refs for layout + canvas painting
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRefs = useRef<Array<HTMLElement | null>>([])
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    setSupported(detectFeature())
  }, [])

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

    // drawElement() spec showcase — paint the focused team's <img> ON the
    // cylinder body (near the right end). Positioning over the cylinder
    // means the flourish can never clip past the chart's right edge,
    // regardless of how short or long the bar is. Same DOM element is
    // also rendered as HTML (focusable, screen-reader-readable); the
    // canvas just gets a visual flourish. Falls back to ctx.drawImage so
    // the effect works without the flag too.
    if (focusedIdx !== null) {
      const track = trackRefs.current[focusedIdx]
      const btn = buttonRefs.current[focusedIdx]
      const logo = btn?.querySelector('img') as HTMLImageElement | null
      if (track && logo) {
        const r = track.getBoundingClientRect()
        const fillW = (DATA[focusedIdx].value / MAX) * r.width
        const SIZE = 36 // painted-logo diameter
        // Center the flourish inside the cylinder, 22px from its right end.
        // For very short bars, fall back to the cylinder's midpoint.
        const targetFromRight = 22
        const minCx = SIZE / 2 + 4
        const cxLocal = Math.max(minCx, fillW - targetFromRight)
        const cx = r.left - wrapperRect.left + cxLocal
        const cy = r.top - wrapperRect.top + r.height / 2

        ctx.save()
        ctx.shadowColor = DATA[focusedIdx].color
        ctx.shadowBlur = 14
        ctx.globalAlpha = 0.85
        ctx.translate(cx, cy)
        const scale = SIZE / 24
        ctx.scale(scale, scale)
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
                  onFocus={() => handleFocus(i)}
                  onBlur={handleBlur}
                  paintingViaCanvas
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
// BAR BUTTON
// =============================================================================

function BarButton({
  data,
  index,
  onFocus,
  onBlur,
  paintingViaCanvas,
  btnRef,
  trackRef,
}: {
  data: Bar
  index: number
  onFocus: () => void
  onBlur: () => void
  paintingViaCanvas: boolean
  btnRef: (el: HTMLButtonElement | null) => void
  trackRef: (el: HTMLElement | null) => void
}) {
  const widthPct = (data.value / MAX) * 100

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
      >
        {paintingViaCanvas ? null : (
          <>
            <span className="absolute inset-0 bg-muted/60" aria-hidden="true" />
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
          The 3D cylinders are painted to a <code className="font-mono">&lt;canvas&gt;</code>{' '}
          2D context. <strong>Focus a bar</strong> and its team logo gets painted via{' '}
          <code className="font-mono">drawElement()</code> — the same{' '}
          <code className="font-mono">&lt;img&gt;</code> that's in the accessibility
          tree, also rendered as canvas pixels with a colored glow.
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
        The 3D cylinders below are painted with normal Canvas 2D (no flag required).
        The <code className="font-mono">drawElement()</code> flourish on focus uses{' '}
        a fallback. To see the real spec primitive, open{' '}
        <code className="font-mono select-all">
          chrome://flags/#canvas-draw-element
        </code>{' '}
        in Chrome Canary or Brave Stable and restart.
      </span>
    </div>
  )
}

function Caption({ supported }: { supported: boolean | null }) {
  return (
    <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
      Tab/Shift+Tab to move between bars. The live region above announces the focused
      bar's label and value to assistive tech. The buttons are standard HTML — native
      accessibility patterns work as-is. The cylinder fills and the focus flourish are
      painted to a <code className="font-mono">&lt;canvas&gt;</code> overlaid behind
      the buttons.{' '}
      {supported === true && (
        <>
          With the flag detected, the focus flourish uses the real{' '}
          <code className="font-mono">drawElement()</code> spec primitive to paint the
          focused <code className="font-mono">&lt;img&gt;</code> directly to the
          canvas.
        </>
      )}
      {supported === false && (
        <>
          Without the flag, the focus flourish falls back to{' '}
          <code className="font-mono">ctx.drawImage</code> so the cylinders + glow
          still work.
        </>
      )}
    </p>
  )
}
