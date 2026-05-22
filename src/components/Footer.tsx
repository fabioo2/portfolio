import { profile } from '@/data/resume'

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-20">
      <div className="container py-10 flex flex-col items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-6">
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            GitHub
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            LinkedIn
          </a>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            Resume
          </a>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} {profile.name} — All systems operational.
        </p>
        <p className="text-[11px] text-muted-foreground/70 max-w-md text-center leading-relaxed">
          No tracking, no analytics. One localStorage flag remembers which Lab posts you've seen.
        </p>
      </div>
    </footer>
  )
}
