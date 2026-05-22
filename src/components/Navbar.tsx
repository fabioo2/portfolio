import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { scrollToId } from '@/lib/scroll'
import { useHasUnreadLabPost } from '@/lib/labNotification'
import { ThemeToggle } from '@/components/ThemeToggle'
import { profile } from '@/data/resume'

function LabLink({
  className,
  isActive,
}: {
  className?: string
  isActive: boolean
}) {
  const hasUnread = useHasUnreadLabPost()
  return (
    <Link
      to="/lab"
      className={cn(
        'relative text-muted-foreground hover:text-foreground transition-colors',
        isActive && 'text-foreground underline underline-offset-8 decoration-2',
        className
      )}
    >
      <span className={hasUnread ? 'animate-lab-text' : undefined}>Lab</span>
      {hasUnread && (
        <span
          className="absolute -top-1 -right-2.5 h-2 w-2 rounded-full bg-rose-500"
          aria-label="New post in the Lab"
        />
      )}
    </Link>
  )
}

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
          {homeAnchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              onClick={handleAnchor(a.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {a.label}
            </a>
          ))}
          <LabLink isActive={location.pathname.startsWith('/lab')} />
          <ThemeToggle />
        </nav>

        {/* Mobile: Lab link + theme toggle */}
        <nav className="md:hidden flex items-center gap-3 text-sm">
          <LabLink isActive={location.pathname.startsWith('/lab')} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
