import { Swords, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { CrusadeUnit } from '@/types/crusade'
import { RANK_XP_THRESHOLDS, xpToNextRank, RANK_ORDER } from '@/types/crusade'
import { useCrusade } from '@/lib/CrusadeContext'
import type { PageId } from '@/App'

const RANK_COLOR: Record<string, string> = {
  'Battle-ready': 'text-muted-foreground',
  'Blooded': 'text-emerald-400',
  'Battle-hardened': 'text-yellow-400',
  'Heroic': 'text-orange-400',
  'Legendary': 'text-glow-crimson',
}

interface UnitStatsPanelProps {
  unit: CrusadeUnit
  onNavigate: (page: PageId) => void
}

export function UnitStatsPanel({ unit, onNavigate }: UnitStatsPanelProps) {
  const { force, supplyUsed } = useCrusade()

  const currentRankIdx = RANK_ORDER.indexOf(unit.rank)
  const isLegendary = unit.rank === 'Legendary'
  const nextRankXp = xpToNextRank(unit.rank)
  const prevRankXp = currentRankIdx > 0 ? RANK_XP_THRESHOLDS[RANK_ORDER[currentRankIdx - 1]] : 0
  const xpProgress = isLegendary
    ? 100
    : ((unit.xp - prevRankXp) / (nextRankXp - prevRankXp)) * 100

  const supplyPct = Math.min((supplyUsed / force.supplyLimit) * 100, 100)

  return (
    <div className="panel-angled flex h-full flex-col gap-5 border border-border bg-card px-5 py-5">

      {/* Rank */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Rank
        </p>
        <p className={`text-2xl font-bold uppercase tracking-wide ${RANK_COLOR[unit.rank]}`}>
          {unit.rank}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>XP {unit.xp}</span>
            <span>{isLegendary ? 'Max Rank' : `Next: ${nextRankXp} XP`}</span>
          </div>
          <Progress value={xpProgress} />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Battle Tally */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Battle Tally
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-border bg-secondary px-3 py-2 text-center">
            <p className="text-lg font-bold text-foreground">{unit.battleTally.battlesParticipated}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Battles</p>
          </div>
          <div className="rounded border border-border bg-secondary px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Swords className="size-3 text-crimson-bright" />
              <p className="text-lg font-bold text-foreground">{unit.battleTally.unitsDestroyed}</p>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Kills</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Points Cost / Max / RP */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Points
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded border border-border bg-secondary px-2 py-2">
            <p className="text-base font-bold text-foreground">{unit.pointsCost}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cost</p>
          </div>
          <div className="rounded border border-border bg-secondary px-2 py-2">
            <p className="text-base font-bold text-foreground">{force.supplyLimit}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Max</p>
          </div>
          <div className="rounded border border-crimson/40 bg-crimson/10 px-2 py-2">
            <p className="text-base font-bold text-crimson-bright">{force.requisitionPoints}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">RP</p>
          </div>
        </div>
      </div>

      {/* Supply */}
      <div>
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="size-3" />
            <span>Supply</span>
          </div>
          <span>{supplyUsed} / {force.supplyLimit}</span>
        </div>
        <Progress value={supplyPct} />
      </div>

      {/* Crusade Force */}
      <div className="rounded border border-border bg-secondary px-3 py-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Crusade Force</p>
        <p className="mt-0.5 text-xs font-semibold text-foreground">{force.name}</p>
        <p className="text-[10px] text-muted-foreground">{force.faction}</p>
      </div>

      {/* Honour slots */}
      <div>
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Star className="size-3 text-yellow-400" />
          Honour Slots
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm ${
                i < unit.battleHonours.length
                  ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                  : 'bg-secondary border border-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <Button size="lg" className="w-full" onClick={() => onNavigate('game')}>
          Enter Game Mode
        </Button>
      </div>
    </div>
  )
}
