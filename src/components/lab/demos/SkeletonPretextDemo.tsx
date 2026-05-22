import { useState, useEffect, useMemo } from 'react'
import { prepare, layout } from '@chenglou/pretext'
import { Button } from '@/components/ui/button'

const SAMPLE_TEXT =
  "Pretext is a pure JavaScript text-measurement library that side-steps the DOM. " +
  "By computing line counts and total height in pure arithmetic, we can pre-render skeleton " +
  "placeholders that match the eventual content exactly — eliminating layout shift when the real " +
  "content loads in. Try editing this text or dragging the width slider below to see it recalculate live."

const FONT = '16px Inter'
const LINE_HEIGHT = 24
const LOAD_DURATION_MS = 2000
const NAIVE_LINE_COUNT = 3 // what every "skeleton loader" component on the web does

type Phase = 'idle' | 'loading' | 'loaded'

export default function SkeletonPretextDemo() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [width, setWidth] = useState(420)
  const [phase, setPhase] = useState<Phase>('idle')
  const [trigger, setTrigger] = useState(0)

  // Pretext-computed layout (cheap arithmetic after `prepare`)
  const { lineCount, height } = useMemo(() => {
    if (!text.trim()) return { lineCount: 0, height: 0 }
    const prepared = prepare(text, FONT)
    return layout(prepared, width, LINE_HEIGHT)
  }, [text, width])

  // Naive skeleton's "guess" — always 3 lines like every loading state on the web
  const naiveHeight = NAIVE_LINE_COUNT * LINE_HEIGHT

  function simulate() {
    setPhase('loading')
    setTrigger((t) => t + 1)
  }

  useEffect(() => {
    if (phase !== 'loading') return
    const id = window.setTimeout(() => setPhase('loaded'), LOAD_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [phase, trigger])

  function reset() {
    setPhase('idle')
  }

  return (
    <div className="my-8 border border-border rounded-xl bg-card overflow-hidden">
      {/* Controls */}
      <div className="p-5 md:p-6 border-b border-border bg-muted/30 space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full text-sm leading-6 font-sans bg-background border border-border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder="Type or paste anything…"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-3 text-sm">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground w-14">
              Width
            </span>
            <input
              type="range"
              min={200}
              max={520}
              step={10}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-48 accent-[hsl(var(--brand))]"
            />
            <span className="font-mono text-xs tabular-nums text-muted-foreground w-12">
              {width}px
            </span>
          </label>

          {phase === 'idle' && (
            <Button onClick={simulate} size="sm">
              Simulate Load
            </Button>
          )}
          {phase !== 'idle' && (
            <Button onClick={reset} size="sm" variant="outline">
              Reset
            </Button>
          )}

          <div className="ml-auto text-xs font-mono text-muted-foreground tabular-nums">
            Pretext says: <span className="text-foreground">{lineCount} lines · {Math.round(height)}px</span>
          </div>
        </div>
      </div>

      {/* Side-by-side */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <Column
          title="Naive skeleton"
          subtitle="Always 3 fake lines"
          tone="bad"
          phase={phase}
          text={text}
          width={width}
          skeletonLineCount={NAIVE_LINE_COUNT}
          skeletonHeight={naiveHeight}
          contentHeight={height}
        />
        <Column
          title="Pretext skeleton"
          subtitle="Pre-calculated exact size"
          tone="good"
          phase={phase}
          text={text}
          width={width}
          skeletonLineCount={lineCount}
          skeletonHeight={height}
          contentHeight={height}
        />
      </div>
    </div>
  )
}

function Column({
  title,
  subtitle,
  tone,
  phase,
  text,
  width,
  skeletonLineCount,
  skeletonHeight,
  contentHeight,
}: {
  title: string
  subtitle: string
  tone: 'good' | 'bad'
  phase: Phase
  text: string
  width: number
  skeletonLineCount: number
  skeletonHeight: number
  contentHeight: number
}) {
  // The "container" height in the loaded state is the actual content height.
  // In the loading state, it's the skeleton height (which may be wrong for naive!).
  const containerHeight =
    phase === 'loaded' || phase === 'idle' ? contentHeight : skeletonHeight

  const isLayoutShift = phase === 'loaded' && tone === 'bad' && Math.abs(skeletonHeight - contentHeight) > 4

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <div className="font-serif text-lg font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
            tone === 'good'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
          }`}
        >
          {tone === 'good' ? '✓ accurate' : '✗ guesstimate'}
        </span>
      </div>

      {/* The content slot — height transitions visibly on the bad side */}
      <div
        className="relative bg-background/50 rounded-md border border-dashed border-border/60 overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height: `${containerHeight}px`, width: `${width}px`, maxWidth: '100%' }}
      >
        {phase === 'loading' ? (
          <SkeletonLines count={skeletonLineCount} />
        ) : phase === 'loaded' ? (
          <div
            className="p-0 text-sm font-sans"
            style={{
              fontFamily: 'Inter',
              fontSize: '16px',
              lineHeight: `${LINE_HEIGHT}px`,
              width: `${width}px`,
              maxWidth: '100%',
            }}
          >
            {text}
          </div>
        ) : (
          <div className="p-3 text-xs text-muted-foreground italic">
            Click "Simulate Load" to see what happens →
          </div>
        )}
      </div>

      {/* The "next content" marker — moves visibly when bad skeleton mis-sized */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <div className="text-xs text-muted-foreground">
          Other content below
          {isLayoutShift && (
            <span className="ml-2 inline-block animate-pulse text-rose-600 dark:text-rose-400 font-mono">
              ← jumped {Math.round(contentHeight - skeletonHeight)}px
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonLines({ count }: { count: number }) {
  return (
    <div className="p-0">
      {Array.from({ length: count }).map((_, i) => {
        const isLast = i === count - 1
        // last line is shorter to look natural; full-width otherwise
        const widthPct = isLast ? 60 + Math.random() * 25 : 100
        return (
          <div
            key={i}
            className="bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%] animate-shimmer rounded-sm"
            style={{
              height: `${LINE_HEIGHT - 8}px`,
              marginTop: i === 0 ? '4px' : '4px',
              marginBottom: i === count - 1 ? '4px' : '4px',
              width: `${widthPct}%`,
            }}
          />
        )
      })}
    </div>
  )
}
