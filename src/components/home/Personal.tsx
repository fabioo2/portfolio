import { motion } from 'framer-motion'
import { Coffee, Cpu, Fish, Gamepad2 } from 'lucide-react'
import { personal, type HobbyIcon } from '@/data/resume'

const iconMap: Record<HobbyIcon, typeof Coffee> = {
  gamepad: Gamepad2,
  cpu: Cpu,
  fish: Fish,
  coffee: Coffee,
}

export function Personal() {
  return (
    <section className="bg-muted/30 border-b border-border/60">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Off the Clock
            </div>
            <div className="mt-2 w-8 h-px bg-foreground" />
          </motion.div>

          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg leading-relaxed mb-8"
            >
              {personal.intro}
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {personal.hobbies.map((h, i) => {
                const Icon = iconMap[h.icon]
                return (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <Icon className="size-5 mt-0.5 text-[hsl(var(--brand))] shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{h.label}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {h.detail}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
