import { motion } from 'framer-motion'
import { experience, education } from '@/data/resume'

export function Background() {
  return (
    <section id="background" className="border-b border-border/60">
      <div className="container py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl md:text-4xl font-medium mb-10"
        >
          Background
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Experience */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6">Professional Experience</h3>
            <div className="space-y-8">
              {experience.map((c) => (
                <div key={c.company}>
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <span className="font-semibold">{c.company}</span>
                  </div>
                  <div className="text-xs italic text-muted-foreground mb-3">{c.location}</div>
                  <ul className="space-y-1.5 border-l border-border pl-4">
                    {c.roles.map((r) => (
                      <li
                        key={r.title}
                        className="flex items-baseline justify-between gap-4 text-sm"
                      >
                        <span className="text-foreground">{r.title}</span>
                        <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
                          {r.dates}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-serif text-xl font-medium mb-6">Education</h3>
            <div className="space-y-5">
              {education.map((e) => (
                <div key={e.school}>
                  <div className="font-semibold">{e.school}</div>
                  <div className="text-sm text-muted-foreground">{e.credential}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
