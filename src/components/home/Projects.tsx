import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects } from '@/data/resume'

export function Projects() {
  return (
    <section id="experience" className="bg-muted/30 border-b border-border/60">
      <div className="container py-16 md:py-24">
        <div className="flex items-end justify-between gap-4 mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl font-medium"
          >
            Key Projects
          </motion.h2>
          <a
            href="https://github.com/fabioo2"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            GitHub Repository <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-5 auto-rows-fr">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="h-full"
            >
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block group h-full"
                >
                  <ProjectInner project={p} />
                </a>
              ) : (
                <ProjectInner project={p} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectInner({ project: p }: { project: typeof projects[number] }) {
  return (
    <Card className="h-full flex flex-col transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{p.name}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {p.period}
            </span>
            {p.external && <ExternalLink className="size-3.5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
          {p.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
