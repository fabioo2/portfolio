import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { profile } from '@/data/resume'

// Lazy-load the 3D monitor so three.js doesn't block first paint
const CrtMonitor = lazy(() =>
  import('./CrtMonitor').then((m) => ({ default: m.CrtMonitor }))
)

function MonitorFallback() {
  return (
    <div className="w-full aspect-square max-w-[320px] mx-auto md:mx-0 rounded-2xl bg-muted/40 animate-pulse" />
  )
}

export function Hero() {
  return (
    <section className="bg-muted/40 border-b border-border/60">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Suspense fallback={<MonitorFallback />}>
              <CrtMonitor />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]">
              {profile.title}
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground text-base md:text-lg leading-relaxed">
              {profile.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#experience">View Experience</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#summary">About Me</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
