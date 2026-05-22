import { motion } from 'framer-motion'
import { skills } from '@/data/resume'

export function Skills() {
  return (
    <section id="skills" className="border-b border-border/60">
      <div className="container py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl md:text-4xl font-medium mb-10"
        >
          Technical Vocabulary
        </motion.h2>

        <div className="border-t border-border pt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(skills).map(([category, items], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3">
                {category}
              </div>
              <ul className="text-sm leading-7 text-muted-foreground">
                {items.map((s) => (
                  <li key={s} className="hover:text-foreground transition-colors">
                    · {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
