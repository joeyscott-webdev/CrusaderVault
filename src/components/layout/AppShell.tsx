import { NavLink } from 'react-router-dom'
import { Shield, Swords, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Crumb {
  label: string
  href?: string
}

interface AppShellProps {
  children: React.ReactNode
  breadcrumbs?: Crumb[]
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <Shield className="size-5 text-crimson-bright" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">
              Crusader<span className="text-glow-crimson">Vault</span>
            </span>
          </NavLink>

          <div className="h-4 w-px bg-border" />

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors',
                  isActive
                    ? 'text-glow-crimson'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-crimson shadow-[0_0_8px_var(--crimson-glow)]" />
                  )}
                </>
              )}
            </NavLink>
            <NavLink
              to="/crusades"
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors',
                  isActive
                    ? 'text-glow-crimson'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  Crusades
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-crimson shadow-[0_0_8px_var(--crimson-glow)]" />
                  )}
                </>
              )}
            </NavLink>
          </nav>

          <div className="ml-auto">
            <Swords className="size-4 text-crimson-bright/60" />
          </div>
        </div>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-6 pb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                {crumb.href ? (
                  <NavLink
                    to={crumb.href}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    {crumb.label}
                  </NavLink>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-foreground/80">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}
