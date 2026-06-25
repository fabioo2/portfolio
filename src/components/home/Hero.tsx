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
      aria-label="Loading"
    >
      <span
        className="font-mono text-base"
        style={{
          color: '#00ff41',
          textShadow: '0 0 10px rgba(0, 255, 65, 0.55)',
        }}
      >
        loading
        <span className="animate-loading-dot animate-loading-dot-1" aria-hidden="true">.</span>
        <span className="animate-loading-dot animate-loading-dot-2" aria-hidden="true">.</span>
        <span className="animate-loading-dot animate-loading-dot-3" aria-hidden="true">.</span>
      </span>
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
