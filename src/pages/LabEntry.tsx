import { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Badge } from '@/components/ui/badge'
import { getLabEntry } from '@/data/lab'
import { markLabSeen } from '@/lib/labNotification'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function scrollToDemo() {
  const el = document.getElementById('lab-demo')
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function LabEntry() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? getLabEntry(slug) : undefined

  useEffect(() => {
    markLabSeen()
  }, [])

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

      {entry.demo && (
        <button
          onClick={scrollToDemo}
          className="group inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-[hsl(var(--brand))] font-semibold">TL;DR</span>
          <span>skip to the demo</span>
          <ArrowDown className="size-3 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      <div className="prose-lab">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {entry.body}
        </ReactMarkdown>
      </div>

      {entry.demo && (
        <div id="lab-demo" className="scroll-mt-20 my-2">
          <div className="flex justify-end mb-2">
            <Link
              to={`/lab/${entry.slug}/demo`}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-3" />
              <span>Standalone view</span>
            </Link>
          </div>
          <entry.demo />
        </div>
      )}

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
