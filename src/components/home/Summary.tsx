import { motion } from 'framer-motion'
import { profile } from '@/data/resume'

export function Summary() {
  return (
    <section id="summary" className="border-b border-border/60">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Professional Summary
            </div>
            <div className="mt-2 w-8 h-px bg-foreground" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl space-y-4 text-base md:text-lg leading-relaxed"
          >
            <p>{profile.summary.intro}</p>
            <p className="text-muted-foreground">{profile.summary.current}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
