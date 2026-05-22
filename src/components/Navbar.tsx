import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { scrollToId } from '@/lib/scroll'
import { profile } from '@/data/resume'

const homeAnchors = [
  { id: 'experience', label: 'Experience & Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'background', label: 'Background' },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  function handleAnchor(id: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      if (isHome) {
        scrollToId(id)
      } else {
        // navigate to home, then scroll
        navigate('/')
        setTimeout(() => scrollToId(id), 50)
      }
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="font-serif text-2xl md:text-3xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          {profile.name}
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {isHome &&
            homeAnchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                onClick={handleAnchor(a.id)}
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
