import { Minus, Plus, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CrusadeUnit } from '@/types/crusade'
import type { GameUnit, GameUnitStatus } from '@/types/crusade'

const STATUS_STYLES: Record<GameUnitStatus, string> = {
  'Active': 'border-emerald-500/50 bg-emerald-500/10',
  'Battle-shocked': 'border-yellow-400/50 bg-yellow-400/10',
  'Destroyed': 'border-crimson/50 bg-crimson/10',
  'Out of Action': 'border-zinc-600/50 bg-zinc-900',
}

const STATUS_TEXT: Record<GameUnitStatus, string> = {
  'Active': 'text-emerald-400',
  'Battle-shocked': 'text-yellow-400',
  'Destroyed': 'text-crimson-bright',
  'Out of Action': 'text-zinc-500',
}

const STATUS_CYCLE: GameUnitStatus[] = ['Active', 'Battle-shocked', 'Destroyed', 'Out of Action']

const HONOUR_TYPE_COLOR: Record<string, string> = {
  'Battle Trait': 'text-yellow-400',
  'Weapon Enhancement': 'text-blue-400',
  'Crusade Relic': 'text-purple-400',
  'Epic Deed': 'text-orange-400',
  'Warlord Trait': 'text-crimson-bright',
}

interface UnitGameCardProps {
  unit: CrusadeUnit
  gameUnit: GameUnit
  canMarkForGreatness: boolean
  onStatusChange: (status: GameUnitStatus) => void
  onKillsChange: (delta: number) => void
  onToggleMarkForGreatness: () => void
}

export function UnitGameCard({
  unit,
  gameUnit,
  canMarkForGreatness,
  onStatusChange,
  onKillsChange,
  onToggleMarkForGreatness,
}: UnitGameCardProps) {
  const currentStatusIdx = STATUS_CYCLE.indexOf(gameUnit.status)

  function cycleStatus() {
    const next = STATUS_CYCLE[(currentStatusIdx + 1) % STATUS_CYCLE.length]
    onStatusChange(next)
  }

  const isOut = gameUnit.status === 'Destroyed' || gameUnit.status === 'Out of Action'

  return (
    <div
      className={cn(
        'panel-angled flex flex-col gap-3 border p-4 transition-all',
        STATUS_STYLES[gameUnit.status],
        isOut && 'opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{unit.imageEmoji}</span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-foreground">
              {unit.name}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {unit.datasheetName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onToggleMarkForGreatness}
            disabled={!canMarkForGreatness && !gameUnit.markedForGreatness}
            className={cn(
              'transition-colors',
              gameUnit.markedForGreatness
                ? 'text-yellow-400'
                : canMarkForGreatness
                  ? 'text-muted-foreground hover:text-yellow-400'
                  : 'text-muted-foreground/30 cursor-not-allowed',
            )}
            title="Mark for Greatness (+3 XP)"
          >
            <Star className={cn('size-4', gameUnit.markedForGreatness && 'fill-yellow-400')} />
          </button>
        </div>
      </div>

      {/* Status Toggle */}
      <button
        onClick={cycleStatus}
        className={cn(
          'w-full rounded border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all',
          STATUS_STYLES[gameUnit.status],
          STATUS_TEXT[gameUnit.status],
        )}
      >
        {gameUnit.status}
      </button>

      {/* Battle Honours */}
      {unit.battleHonours.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Battle Honours
          </p>
          {unit.battleHonours.map((h) => (
            <div key={h.id} className="rounded border border-yellow-400/15 bg-yellow-400/5 px-2 py-2">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                  {h.name}
                </p>
                <span className={`text-[9px] uppercase tracking-widest ${HONOUR_TYPE_COLOR[h.type]}`}>
                  {h.type}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                {h.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Battle Scars */}
      {unit.battleScars.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-crimson-bright">
            Battle Scars
          </p>
          {unit.battleScars.map((s) => (
            <div key={s.id} className="rounded border border-crimson/20 bg-crimson/5 px-2 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-crimson-bright">
                {s.name}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                {s.effect}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Kills Counter */}
      <div className="flex items-center justify-between rounded border border-border bg-background/40 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Units Destroyed
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onKillsChange(-1)}
            disabled={gameUnit.killsMadeThisBattle === 0}
            className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-crimson hover:text-crimson-bright disabled:opacity-30"
          >
            <Minus className="size-3" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-foreground">
            {gameUnit.killsMadeThisBattle}
          </span>
          <button
            onClick={() => onKillsChange(1)}
            className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-crimson hover:text-crimson-bright"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      {gameUnit.markedForGreatness && (
        <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-yellow-400">
          ★ Marked for Greatness (+3 XP)
        </p>
      )}
    </div>
  )
}
