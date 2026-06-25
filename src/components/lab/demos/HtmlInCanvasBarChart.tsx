import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'

// Inspired by html-in-canvas.dev/demos/accessible-charts/ —
// vertical bar chart with real DOM labels as canvas children, keyboard
// navigation across bars, a live screen-reader preview panel, and animated
// bar growth on mount. NFC East Super Bowl wins as the dataset.

type Datum = {
  team: string
  abbr: string
  value: number
  color: string
  logo: string
}

const DATA: Datum[] = [
  {
    team: 'Dallas Cowboys',
    abbr: 'DAL',
    value: 5,
    color: '#003594',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  },
  {
    team: 'New York Giants',
    abbr: 'NYG',
    value: 4,
    color: '#0B2265',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  },
  {
    team: 'Washington Commanders',
    abbr: 'WSH',
    value: 3,
    color: '#5A1414',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
  },
  {
    team: 'Philadelphia Eagles',
    abbr: 'PHI',
    value: 2,
    color: '#004C54',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  },
]

const Y_MAX = 5

// Layout constants (CSS px in chart coordinate space)
const PAD_L = 44
const PAD_R = 20
const PAD_T = 12
const PAD_B = 36
const LABEL_BAND = 44 // reserved at top of plot area for HTML labels

// =============================================================================
// HELPERS
// =============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '')
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ]
}

function shift([r, g, b]: [number, number, number], amt: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, n + amt))
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function detectFeature(): boolean {
  if (typeof document === 'undefined') return false
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d') as
    | (CanvasRenderingContext2D & {
        drawElement?: unknown
        drawElementImage?: unknown
      })
    | null
  if (!ctx) return false
  return (
    typeof ctx.drawElement === 'function' ||
    typeof ctx.drawElementImage === 'function'
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HtmlInCanvasBarChart() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [dims, setDims] = useState({ w: 720, h: 360 })

  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    setSupported(detectFeature())
  }, [])

  // Animate bars on mount — sweep from baseline upward over ~900ms.
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / 900)
      setProgress(easeOutCubic(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Resize observer — keep canvas bitmap matched to displayed CSS size so
  // `layoutsubtree` children lay out at 1:1 pixel ratio.
  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      const h = Math.max(300, Math.round(w * 0.5))
      setDims({ w, h })
    })
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  // Derived bar geometry — pure functions of dims + progress.
  const plotW = dims.w - PAD_L - PAD_R
  const plotH = dims.h - PAD_T - PAD_B - LABEL_BAND
  const baseline = PAD_T + LABEL_BAND + plotH
  const innerSlot = plotW / DATA.length
  const barW = Math.min(72, Math.floor(innerSlot * 0.55))

  const barX = (i: number) => PAD_L + innerSlot * i + (innerSlot - barW) / 2
  const barTopFor = (i: number) =>
    baseline - (DATA[i].value / Y_MAX) * plotH * progress

  // ============================================================
  // PAINT
  // ============================================================
  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(dims.w * dpr)
    canvas.height = Math.round(dims.h * dpr)
    canvas.style.width = `${dims.w}px`
    canvas.style.height = `${dims.h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, dims.w, dims.h)

    // ----- Grid + Y-axis ticks -----
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.textBaseline = 'middle'
    for (let v = 0; v <= Y_MAX; v++) {
      const y = baseline - (v / Y_MAX) * plotH
      ctx.strokeStyle = 'rgba(127, 127, 127, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(PAD_L, y)
      ctx.lineTo(dims.w - PAD_R, y)
      ctx.stroke()
      ctx.fillStyle = 'rgba(127, 127, 127, 0.7)'
      ctx.textAlign = 'right'
      ctx.fillText(String(v), PAD_L - 8, y)
    }

    // ----- X-axis baseline -----
    ctx.strokeStyle = 'rgba(127, 127, 127, 0.35)'
    ctx.beginPath()
    ctx.moveTo(PAD_L, baseline)
    ctx.lineTo(dims.w - PAD_R, baseline)
    ctx.stroke()

    // ----- Bars (gradient fills) -----
    DATA.forEach((d, i) => {
      const x = barX(i)
      const yTop = barTopFor(i)
      const h = baseline - yTop
      if (h < 0.5) return

      const base = hexToRgb(d.color)
      const grad = ctx.createLinearGradient(x, yTop, x, baseline)
      grad.addColorStop(0, shift(base, 75))
      grad.addColorStop(0.55, shift(base, 10))
      grad.addColorStop(1, shift(base, -55))
      ctx.fillStyle = grad

      const r = 4
      ctx.beginPath()
      ctx.moveTo(x, baseline)
      ctx.lineTo(x, yTop + r)
      ctx.quadraticCurveTo(x, yTop, x + r, yTop)
      ctx.lineTo(x + barW - r, yTop)
      ctx.quadraticCurveTo(x + barW, yTop, x + barW, yTop + r)
      ctx.lineTo(x + barW, baseline)
      ctx.closePath()
      ctx.fill()

      // Thin highlight strip down the left edge — adds dimension
      const sheen = ctx.createLinearGradient(x, yTop, x + barW * 0.4, yTop)
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = sheen
      ctx.fillRect(x + r, yTop, barW * 0.4, h)

      // X-axis abbreviation under each bar
      ctx.fillStyle = 'rgba(127, 127, 127, 0.85)'
      ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(d.abbr, x + barW / 2, baseline + 10)
    })

    // ----- Hand-drawn focus ring -----
    // (drawFocusIfNeeded crashes in some Chromium builds, so we trace
    //  the focus rect manually — white outer stroke, brand-color inner.)
    if (focusedIdx !== null) {
      const x = barX(focusedIdx)
      const yTop = barTopFor(focusedIdx)
      const h = baseline - yTop
      const labelTop = PAD_T + 4
      const total = h + (yTop - labelTop)

      ctx.save()
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 4
      ctx.strokeRect(x - 5, labelTop - 4, barW + 10, total + 8)
      ctx.strokeStyle = DATA[focusedIdx].color
      ctx.lineWidth = 2
      ctx.strokeRect(x - 5, labelTop - 4, barW + 10, total + 8)
      ctx.restore()
    }

    // ----- drawElement(): composite HTML labels into the canvas -----
    // When the flag is enabled, this is the actual spec primitive — the
    // canvas pixel buffer now contains the label's rasterized pixels at
    // the bar's exact position. The same <button> still lives in the DOM
    // (focusable, screen-reader-readable). Without the flag, we just
    // skip this step — the CSS-positioned labels above the canvas are
    // doing the visible work either way.
    if (supported) {
      const ctxAny = ctx as CanvasRenderingContext2D & {
        drawElement?: (el: Element) => void
        drawElementImage?: (el: Element) => void
      }
      const spec = ctxAny.drawElement || ctxAny.drawElementImage
      if (typeof spec === 'function') {
        DATA.forEach((_, i) => {
          const el = labelRefs.current[i]
          if (!el) return
          const x = barX(i) + barW / 2
          const y = barTopFor(i) - 8
          ctx.save()
          ctx.translate(x, y)
          try {
            spec.call(ctxAny, el)
          } catch {
            // Experimental API — if signature/state differs in this
            // Chromium build, silently skip rather than crash paint.
          }
          ctx.restore()
        })
      }
    }
  }, [dims, focusedIdx, progress, supported, baseline, plotH, barW, innerSlot])

  useLayoutEffect(() => {
    paint()
  }, [paint])

  // Arrow keys move focus across bars (Right/Down → next, Left/Up → prev).
  const onLabelKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next =
          focusedIdx === null
            ? 0
            : Math.min(DATA.length - 1, focusedIdx + 1)
        labelRefs.current[next]?.focus()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev =
          focusedIdx === null
            ? DATA.length - 1
            : Math.max(0, focusedIdx - 1)
        labelRefs.current[prev]?.focus()
      }
    },
    [focusedIdx]
  )

  return (
    <div className="my-6 border border-border rounded-xl bg-card overflow-hidden">
      <FlagBanner supported={supported} />

      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="font-serif text-lg font-medium">
            Super Bowl Wins · NFC East
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tab into the chart, then use <kbd className="font-mono">←</kbd>{' '}
            <kbd className="font-mono">→</kbd> to move between bars.
          </p>
        </div>

        <div
          ref={wrapperRef}
          className="relative bg-muted/20 rounded-lg overflow-hidden"
          role="group"
          aria-label="Super Bowl wins by NFC East franchise"
          style={{ height: `${dims.h}px` }}
        >
          <canvas ref={canvasRef} aria-hidden="true" />

          {/* HTML labels positioned over each bar. These are the actual
              accessibility surface — focusable buttons with full aria
              labels. With the flag enabled, their pixels are ALSO
              composited into the canvas via drawElement() above. */}
          {DATA.map((d, i) => {
            const x = barX(i) + barW / 2
            const y = barTopFor(i) - 8
            return (
              <BarLabel
                key={d.team}
                datum={d}
                index={i}
                x={x}
                y={y}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                onKeyDown={onLabelKeyDown}
                btnRef={(el) => {
                  labelRefs.current[i] = el
                }}
              />
            )
          })}
        </div>

        <SrPreview focusedIdx={focusedIdx} />

        <Caption supported={supported} />
      </div>
    </div>
  )
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

function BarLabel({
  datum,
  index,
  x,
  y,
  onFocus,
  onBlur,
  onKeyDown,
  btnRef,
}: {
  datum: Datum
  index: number
  x: number
  y: number
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void
  btnRef: (el: HTMLButtonElement | null) => void
}) {
  const winsWord = datum.value === 1 ? 'win' : 'wins'

  return (
    <button
      ref={btnRef}
      type="button"
      role="listitem"
      aria-label={`${datum.team}: ${datum.value} Super Bowl ${winsWord}`}
      aria-posinset={index + 1}
      aria-setsize={DATA.length}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className="absolute flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-card/80 backdrop-blur-sm shadow-sm border border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-shadow hover:shadow-md"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <img
        src={datum.logo}
        alt=""
        width="20"
        height="20"
        crossOrigin="anonymous"
        className="flex-shrink-0"
      />
      <span className="font-mono text-sm font-bold tabular-nums leading-none">
        {datum.value}
      </span>
    </button>
  )
}

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
          The labels above each bar are real HTML <code className="font-mono">&lt;button&gt;</code>s,
          and their pixels are also composited into the canvas via{' '}
          <code className="font-mono">drawElement()</code> — the same DOM
          element is both the accessibility surface AND a canvas-painted
          asset.
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
        The chart still works — bars are painted to the canvas, labels are
        CSS-positioned HTML buttons on top. To see the real{' '}
        <code className="font-mono">drawElement()</code> spec primitive
        composite the labels into the canvas pixel buffer, open{' '}
        <code className="font-mono select-all">
          chrome://flags/#canvas-draw-element
        </code>{' '}
        in Chrome Canary or Brave Stable and restart.
      </span>
    </div>
  )
}

function SrPreview({ focusedIdx }: { focusedIdx: number | null }) {
  const announcement =
    focusedIdx === null
      ? 'Focus a bar to preview what a screen reader announces.'
      : `${DATA[focusedIdx].team}: ${DATA[focusedIdx].value} Super Bowl ${
          DATA[focusedIdx].value === 1 ? 'win' : 'wins'
        }`

  return (
    <div
      className="mt-4 p-3 rounded-md bg-muted/40 border border-border/60"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-2 h-2 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Screen reader preview
        </span>
      </div>
      <p className="text-sm font-mono text-foreground/90 min-h-[1.4em]">
        {focusedIdx === null ? (
          <span className="text-muted-foreground italic">{announcement}</span>
        ) : (
          announcement
        )}
      </p>
    </div>
  )
}

function Caption({ supported }: { supported: boolean | null }) {
  return (
    <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
      Inspired by the{' '}
      <a
        href="https://html-in-canvas.dev/demos/accessible-charts/"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
      >
        accessible-charts demo
      </a>{' '}
      on html-in-canvas.dev. The canvas paints bars + grid + axis labels;
      each value above is a real <code className="font-mono">&lt;button&gt;</code>{' '}
      with an <code className="font-mono">aria-label</code> screen readers
      announce.{' '}
      {supported === true && (
        <>
          With the flag detected, every paint frame also composites the
          buttons into the canvas pixel buffer via{' '}
          <code className="font-mono">drawElement()</code>.
        </>
      )}
      {supported === false && (
        <>
          Without the flag, the labels are CSS-positioned over the canvas.
          With it on, they'd be composited into the canvas itself.
        </>
      )}
    </p>
  )
}
