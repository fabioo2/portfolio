import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { scrollHandler } from '@/lib/scroll'
import { useTypewriter } from '@/lib/useTypewriter'
import { profile } from '@/data/resume'

// Lazy-load the 3D monitor so three.js doesn't block first paint
const CrtMonitor = lazy(() =>
  import('./CrtMonitor').then((m) => ({ default: m.CrtMonitor }))
)

function MonitorFallback() {
  return (
    <div
      className="w-full aspect-square max-w-[260px] sm:max-w-[300px] md:max-w-[360px] mx-auto md:mx-0 flex items-center justify-center"
      role="status"
      aria-label="Booting CRT monitor"
    >
      <div
        className="relative rounded-md px-5 py-4 leading-relaxed overflow-hidden"
        style={{
          background: '#070a07',
          color: '#7bff9c',
          border: '1px solid rgba(123, 255, 156, 0.35)',
          fontFamily: '"Courier New", "Courier", monospace',
          fontSize: '12px',
          boxShadow:
            '0 0 24px rgba(123, 255, 156, 0.18), inset 0 0 18px rgba(123, 255, 156, 0.06)',
          textShadow: '0 0 6px rgba(123, 255, 156, 0.55)',
          minWidth: '170px',
        }}
      >
        <div>&gt; boot crt.fkos</div>
        <div className="opacity-70 mt-1">tube warming&hellip;</div>
        <div className="mt-2">
          &gt;{' '}
          <span
            className="animate-cursor inline-block text-[hsl(var(--brand))]"
            aria-hidden="true"
            style={{ color: '#7bff9c' }}
          >
            _
          </span>
        </div>
        <div className="absolute inset-0 scanlines pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-[#7bff9c]/40 animate-crt-scan pointer-events-none" />
      </div>
    </div>
  )
}

export function Hero() {
  const typed = useTypewriter(profile.titles)

  return (
    <section className="bg-muted/40 border-b border-border/60">
      <div className="container py-10 md:py-24">
        <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="order-1 md:order-none"
          >
            <Suspense fallback={<MonitorFallback />}>
              <CrtMonitor />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="order-2 md:order-none text-center md:text-left"
          >
            <h1
              className="font-serif text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight leading-[1.05] min-h-[1.05em]"
              aria-label={profile.title}
            >
              <span className="text-muted-foreground/70 mr-2 md:mr-4">&gt;</span>
              <span>{typed}</span>
              <span
                className="animate-cursor inline-block ml-1 text-[hsl(var(--brand))] translate-y-[-0.05em]"
                aria-hidden="true"
              >
                _
              </span>
            </h1>
            <p className="mt-4 md:mt-5 max-w-xl mx-auto md:mx-0 text-muted-foreground text-base md:text-lg leading-relaxed">
              {profile.tagline}
            </p>
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <Button size="lg" onClick={scrollHandler('experience')}>
                View Experience
              </Button>
              <Button variant="outline" size="lg" onClick={scrollHandler('summary')}>
                About Me
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
