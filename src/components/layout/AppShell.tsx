import { type ReactNode } from 'react'
import { Shield, Coins, Bell, Settings, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = ['Home', 'Campaigns', 'Rosters', 'Units', 'Profile'] as const

interface AppShellProps {
  children: ReactNode
  activeNav?: (typeof NAV_ITEMS)[number]
}

export function AppShell({ children, activeNav = 'Rosters' }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-crimson-bright" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">
              Crusader<span className="text-glow-crimson">Vault</span>
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className={cn(
                  'relative py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground',
                  item === activeNav && 'text-glow-crimson',
                )}
              >
                {item}
                {item === activeNav && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-crimson shadow-[0_0_8px_var(--crimson-glow)]" />
                )}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Coins className="size-4 text-crimson-bright" />
            <span>8,477 pts</span>
          </div>
          <Bell className="size-4 text-muted-foreground hover:text-foreground" />
          <Settings className="size-4 text-muted-foreground hover:text-foreground" />
          <UserCircle2 className="size-5 text-muted-foreground hover:text-foreground" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}
