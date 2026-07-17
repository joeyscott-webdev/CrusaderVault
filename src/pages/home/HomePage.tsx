import { Link } from 'react-router-dom'
import { Swords, ChevronRight, Trophy, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/lib/StoreContext'

export function HomePage() {
  const { crusades, armies, units, battles } = useAppStore()

  const totalWins = battles.filter(
    (b) => b.phase === 'complete' && b.result === 'Win',
  ).length

  return (
    <AppShell>
      {/* Full-width hero with commander image */}
      <div className="relative -mx-6 -mt-6 mb-0 overflow-hidden">
        {/* Commander background image */}
        <div
          className="relative h-[420px] w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/commander.png')" }}
        >
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

          {/* Centered content over image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <img
              src="/logo.png"
              alt="CrusaderVault"
              className="h-52 w-auto drop-shadow-[0_0_32px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="flex flex-col items-center pt-2 pb-16">
        <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
          Track your Warhammer 40,000 Crusade campaigns — units, battles, honours, and glory.
        </p>

        {/* Stats row */}
        {crusades.length > 0 && (
          <div className="mb-8 flex gap-6">
            <div className="panel-angled flex flex-col items-center gap-1 border border-border bg-card px-6 py-4">
              <span className="text-2xl font-black text-foreground">{crusades.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {crusades.length === 1 ? 'Crusade' : 'Crusades'}
              </span>
            </div>
            <div className="panel-angled flex flex-col items-center gap-1 border border-border bg-card px-6 py-4">
              <span className="text-2xl font-black text-foreground">{units.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Units
              </span>
            </div>
            <div className="panel-angled flex flex-col items-center gap-1 border border-border bg-card px-6 py-4">
              <span className="text-2xl font-black text-crimson-bright">{totalWins}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Battles Won
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          to="/crusades"
          className="panel-angled group flex items-center gap-3 border border-crimson/50 bg-crimson/10 px-8 py-4 text-sm font-bold uppercase tracking-widest text-crimson-bright shadow-[0_0_24px_var(--crimson-glow)] transition-all hover:border-crimson hover:bg-crimson/20 hover:shadow-[0_0_32px_var(--crimson-glow)]"
        >
          <Swords className="size-5" />
          {crusades.length === 0 ? 'Begin Your Crusade' : 'View My Crusades'}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Recent crusades */}
        {crusades.length > 0 && (
          <div className="mt-12 w-full max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="size-4 text-crimson-bright" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Recent Crusades
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              {crusades.slice(0, 3).map((c) => {
                const army = armies.find((a) => a.crusadeId === c.id)
                const armyUnits = units.filter((u) => u.armyId === army?.id)
                const crusadeBattles = battles.filter(
                  (b) => b.armyId === army?.id && b.phase === 'complete',
                )
                return (
                  <Link
                    key={c.id}
                    to={`/crusades/${c.id}`}
                    className="panel-angled group flex items-center gap-4 border border-border bg-card px-4 py-3 transition-all hover:border-muted-foreground"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      {c.description && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {c.description}
                        </span>
                      )}
                    </div>
                    {army && (
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {armyUnits.length} units
                        </span>
                        <span className="flex items-center gap-1">
                          <Swords className="size-3" />
                          {crusadeBattles.length} battles
                        </span>
                      </div>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state guidance */}
        {crusades.length === 0 && (
          <div className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: '⚔️', title: 'Create a Crusade', desc: 'Start a new campaign and give it a name.' },
              { icon: '🛡️', title: 'Build Your Army', desc: 'Add units, set your Supply Limit and Requisition.' },
              { icon: '🏆', title: 'Fight Battles', desc: 'Track honours, scars, and glory across every game.' },
            ].map((step) => (
              <div key={step.title} className="panel-angled border border-border bg-card/50 p-4 text-center">
                <div className="mb-2 text-2xl">{step.icon}</div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-foreground">
                  {step.title}
                </div>
                <div className="text-[10px] text-muted-foreground">{step.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
