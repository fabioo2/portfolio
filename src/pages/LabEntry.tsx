import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Badge } from '@/components/ui/badge'
import { getLabEntry } from '@/data/lab'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function LabEntry() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? getLabEntry(slug) : undefined

  if (!entry) {
    return <Navigate to="/lab" replace />
  }

  return (
    <article className="container py-12 md:py-16 max-w-3xl">
      <Link
        to="/lab"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-3.5" /> Back to Lab
      </Link>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <Badge variant="brand">
          {entry.type === 'poc' ? 'POC' : entry.type[0].toUpperCase() + entry.type.slice(1)}
        </Badge>
        <span className="font-mono text-muted-foreground">{formatDate(entry.date)}</span>
      </div>

      <div className="prose-lab">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {entry.body}
        </ReactMarkdown>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
          {entry.tags.map((t) => (
            <span key={t} className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
