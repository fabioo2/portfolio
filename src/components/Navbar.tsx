import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { profile } from '@/data/resume'

const homeAnchors = [
  { href: '#experience', label: 'Experience & Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#background', label: 'Background' },
]

export function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-serif text-lg font-semibold tracking-tight">
          {profile.name}
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {isHome &&
            homeAnchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {a.label}
              </a>
            ))}
          <Link
            to="/lab"
            className={cn(
              'text-muted-foreground hover:text-foreground transition-colors',
              location.pathname.startsWith('/lab') &&
                'text-foreground underline underline-offset-8 decoration-2'
            )}
          >
            Lab
          </Link>
        </nav>

        {/* Mobile: just show Lab link */}
        <nav className="md:hidden flex items-center gap-4 text-sm">
          <Link
            to="/lab"
            className={cn(
              'text-muted-foreground',
              location.pathname.startsWith('/lab') && 'text-foreground'
            )}
          >
            Lab
          </Link>
        </nav>
      </div>
    </header>
  )
}
