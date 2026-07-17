import { useState } from 'react'
import { Swords } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { UnitSidebarList } from '@/components/units/UnitSidebarList'
import { UnitShowcase } from '@/components/units/UnitShowcase'
import { UnitStatsPanel } from '@/components/units/UnitStatsPanel'
import { AddUnitModal } from '@/components/units/AddUnitModal'
import { useCrusade } from '@/lib/CrusadeContext'
import type { PageId } from '@/App'
import { cn } from '@/lib/utils'

const RESULT_STYLE: Record<string, string> = {
  Win: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
  Loss: 'border-crimson/50 text-crimson-bright bg-crimson/10',
  Draw: 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10',
}

interface DashboardPageProps {
  onNavigate: (page: PageId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { units, battleHistory } = useCrusade()
  const [selectedId, setSelectedId] = useState(units[0]?.id ?? '')
  const [showAddModal, setShowAddModal] = useState(false)

  // Keep selectedId valid when a unit is removed
  const selectedUnit =
    units.find((u) => u.id === selectedId) ?? units[0]

  if (units.length === 0) {
    return (
      <AppShell activePage="dashboard" onNavigate={onNavigate}>
        {showAddModal && <AddUnitModal onClose={() => setShowAddModal(false)} />}
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <span className="text-5xl opacity-30">⚔️</span>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Your Crusade Force has no units yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="panel-angled border border-dashed border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
          >
            + Add Your First Unit
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell activePage="dashboard" onNavigate={onNavigate}>
      {showAddModal && <AddUnitModal onClose={() => setShowAddModal(false)} />}

      {/* Main roster layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
        <UnitSidebarList
          units={units}
          selectedId={selectedUnit?.id ?? ''}
          onSelect={(id) => setSelectedId(id)}
          onAddUnit={() => setShowAddModal(true)}
        />
        <div className="min-h-[540px]">
          {selectedUnit && <UnitShowcase unit={selectedUnit} />}
        </div>
        {selectedUnit && (
          <UnitStatsPanel unit={selectedUnit} onNavigate={onNavigate} />
        )}
      </div>

      {/* Battle History */}
      {battleHistory.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <Swords className="size-4 text-crimson-bright" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Battle History
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            {battleHistory.slice(0, 8).map((battle) => {
              const totalKills = battle.unitSummaries.reduce((s, u) => s + u.kills, 0)
              const date = new Date(battle.playedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short',
              })
              return (
                <div
                  key={battle.id}
                  className="panel-angled flex flex-wrap items-center gap-4 border border-border bg-card px-4 py-3"
                >
                  <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest', RESULT_STYLE[battle.result])}>
                    {battle.result}
                  </span>

                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground">{battle.missionName}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{battle.missionType} · {battle.gamePts} pts</span>
                  </div>

                  <div className="ml-auto flex items-center gap-6 text-xs">
                    <span className="text-foreground">
                      <span className="font-bold">{battle.yourVP}</span>
                      <span className="text-muted-foreground"> VP</span>
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-foreground">
                      <span className="font-bold">{battle.opponentVP}</span>
                      <span className="text-muted-foreground"> VP</span>
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="flex items-center gap-1 text-foreground">
                      <Swords className="size-3 text-crimson-bright" />
                      <span className="font-bold">{totalKills}</span>
                      <span className="text-muted-foreground">kills</span>
                    </span>
                    <span className="hidden text-muted-foreground sm:inline">{date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AppShell>
  )
}
