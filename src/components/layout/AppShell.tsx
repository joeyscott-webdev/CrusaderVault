import { type ReactNode } from 'react'
import { Shield, Swords, Bell, Settings, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCrusade } from '@/lib/CrusadeContext'
import type { PageId } from '@/App'

const NAV: { label: string; page: PageId | null }[] = [
  { label: 'Home', page: null },
  { label: 'Campaigns', page: null },
  { label: 'Rosters', page: 'dashboard' },
  { label: 'Game Mode', page: 'game' },
  { label: 'Profile', page: null },
]

interface AppShellProps {
  children: ReactNode
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  const { force } = useCrusade()

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
            {NAV.map(({ label, page }) => {
              const isActive = page !== null && page === activePage
              return (
                <button
                  key={label}
                  onClick={() => page && onNavigate(page)}
                  className={cn(
                    'relative py-4 text-xs font-semibold uppercase tracking-widest transition-colors',
                    page
                      ? isActive
                        ? 'text-glow-crimson cursor-default'
                        : 'text-muted-foreground hover:text-foreground cursor-pointer'
                      : 'text-muted-foreground cursor-not-allowed opacity-50',
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-crimson shadow-[0_0_8px_var(--crimson-glow)]" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Swords className="size-4 text-crimson-bright" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              {force.battleTally.battlesWon}W /&nbsp;
              {force.battleTally.battlesLost}L /&nbsp;
              {force.battleTally.battlesDrawn}D
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-crimson-bright">
            {force.requisitionPoints} RP
          </span>
          <Bell className="size-4 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Settings className="size-4 text-muted-foreground hover:text-foreground cursor-pointer" />
          <UserCircle2 className="size-5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}
