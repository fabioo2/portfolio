import { Link } from 'react-router-dom'
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
  return (
    <Link to={`/lab/${entry.slug}`} className="block group">
      <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3 text-xs">
            <Badge variant="brand">{typeLabel[entry.type]}</Badge>
            <span className="font-mono text-muted-foreground">{formatDate(entry.date)}</span>
          </div>
          <h3 className="font-serif text-xl font-medium leading-snug mb-2 group-hover:underline underline-offset-4 decoration-2">
            {entry.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {entry.excerpt}
          </p>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {entry.tags.map((t) => (
                <span key={t} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
