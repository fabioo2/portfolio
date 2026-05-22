import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LabEntry } from '@/data/lab'

const typeLabel: Record<LabEntry['type'], string> = {
  thought: 'Thought',
  poc: 'POC',
  random: 'Random',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function EntryCard({ entry }: { entry: LabEntry }) {
  const navigate = useNavigate()

  // If the entry has a demo, the card primary action is "Try it" (standalone view).
  // Otherwise the card just opens the article.
  const primaryHref = entry.demo
    ? `/lab/${entry.slug}/demo`
    : `/lab/${entry.slug}`

  // Whole card is clickable (programmatic nav so we can layer a separate
  // "Read notes" link inside without nested-anchor markup).
  function onCardClick() {
    navigate(primaryHref)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onCardClick()
        }
      }}
      className="block group h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 text-xs">
            <Badge variant="brand">{typeLabel[entry.type]}</Badge>
            <span className="font-mono text-muted-foreground">{formatDate(entry.date)}</span>
          </div>
          <h3 className="font-serif text-xl font-medium leading-snug mb-2 group-hover:underline underline-offset-4 decoration-2">
            {entry.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
            {entry.excerpt}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3">
            {entry.tags && entry.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3 shrink-0">
              {entry.demo && (
                <Link
                  to={`/lab/${entry.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read notes
                </Link>
              )}
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--brand))] group-hover:gap-1.5 transition-all">
                {entry.demo ? 'Try it' : 'Read'}
                <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
