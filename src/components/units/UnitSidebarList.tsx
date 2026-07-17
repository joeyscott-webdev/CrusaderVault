import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCrusade } from '@/lib/CrusadeContext'
import type { CrusadeUnit } from '@/types/crusade'

const RANK_COLOR: Record<string, string> = {
  'Battle-ready': 'text-muted-foreground',
  'Blooded': 'text-emerald-400',
  'Battle-hardened': 'text-yellow-400',
  'Heroic': 'text-orange-400',
  'Legendary': 'text-glow-crimson',
}

interface UnitSidebarListProps {
  units: CrusadeUnit[]
  selectedId: string
  onSelect: (id: string) => void
  onAddUnit: () => void
}

export function UnitSidebarList({ units, selectedId, onSelect, onAddUnit }: UnitSidebarListProps) {
  const { removeUnit } = useCrusade()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  function handleDelete(id: string) {
    removeUnit(id)
    setPendingDeleteId(null)
    // If we deleted the selected unit, let parent pick a new one
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
          Your Units
        </h2>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Crusade Roster
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {units.map((unit) => {
          const isActive = unit.id === selectedId
          const isPendingDelete = unit.id === pendingDeleteId

          if (isPendingDelete) {
            return (
              <div
                key={unit.id}
                className="panel-angled flex flex-col gap-2 border border-crimson/50 bg-crimson/10 px-3 py-3"
              >
                <p className="text-xs font-semibold text-foreground">
                  Remove <span className="text-crimson-bright">{unit.name}</span>?
                </p>
                <p className="text-[10px] text-muted-foreground">
                  This will permanently remove the unit and all their battle records.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingDeleteId(null)}
                    className="flex-1 rounded border border-border py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="flex-1 rounded border border-crimson/50 bg-crimson/10 py-1 text-[10px] font-semibold uppercase tracking-widest text-crimson-bright hover:bg-crimson/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={unit.id} className="group relative">
              <button
                onClick={() => onSelect(unit.id)}
                className={cn(
                  'panel-angled flex w-full items-center gap-3 border bg-card px-3 py-3 text-left transition-all',
                  isActive
                    ? 'border-glow-crimson bg-secondary'
                    : 'border-border hover:border-muted-foreground',
                  unit.outOfAction && 'opacity-50',
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xl">
                  {unit.imageEmoji}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{unit.name}</span>
                  <span className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                    {unit.datasheetName}
                  </span>
                  <span className={cn('text-[10px] uppercase tracking-widest font-semibold', RANK_COLOR[unit.rank])}>
                    {unit.rank}
                  </span>
                </div>
                {unit.crusadePoints > 0 && (
                  <span className="ml-auto shrink-0 rounded border border-crimson/40 bg-crimson/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-crimson-bright">
                    {unit.crusadePoints} CP
                  </span>
                )}
              </button>

              {/* Delete button — appears on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(unit.id) }}
                className="absolute right-1 top-1 hidden size-6 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-crimson-bright group-hover:flex"
                title="Remove unit"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={onAddUnit}
        className="panel-angled flex items-center justify-center gap-2 border border-dashed border-border bg-transparent px-3 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-crimson hover:text-glow-crimson"
      >
        <Plus className="size-4" />
        Add Unit
      </button>
    </div>
  )
}
