import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getLabEntry } from '@/data/lab'
import { markLabSeen } from '@/lib/labNotification'

export default function LabDemo() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? getLabEntry(slug) : undefined

  useEffect(() => {
    markLabSeen()
  }, [])

  if (!entry) {
    return <Navigate to="/lab" replace />
  }

  // No demo? Redirect to the full entry.
  if (!entry.demo) {
    return <Navigate to={`/lab/${entry.slug}`} replace />
  }

  return (
    <div className="container py-12 md:py-16 max-w-4xl">
      <Link
        to="/lab"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" /> Back to Lab
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs">
            <Badge variant="brand">
              {entry.type === 'poc' ? 'POC' : entry.type[0].toUpperCase() + entry.type.slice(1)}
            </Badge>
            <span className="font-mono text-muted-foreground uppercase tracking-widest">
              Standalone demo
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="mt-2 text-muted-foreground text-sm max-w-2xl leading-relaxed">
              {entry.excerpt}
            </p>
          )}
        </div>

        <Link
          to={`/lab/${entry.slug}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <FileText className="size-3" />
          <span>Read full notes</span>
        </Link>
      </div>

      <entry.demo />
    </div>
  )
}
