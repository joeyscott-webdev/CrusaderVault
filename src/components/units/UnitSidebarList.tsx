import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SampleUnit } from '@/data/sampleUnits'

interface UnitSidebarListProps {
  units: SampleUnit[]
  selectedId: string
  onSelect: (id: string) => void
}

export function UnitSidebarList({ units, selectedId, onSelect }: UnitSidebarListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
          Your Units
        </h2>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Rank S &mdash; A
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {units.map((unit) => {
          const isActive = unit.id === selectedId
          return (
            <button
              key={unit.id}
              onClick={() => onSelect(unit.id)}
              className={cn(
                'panel-angled flex items-center gap-3 border bg-card px-3 py-3 text-left transition-all',
                isActive
                  ? 'border-glow-crimson bg-secondary'
                  : 'border-border hover:border-muted-foreground',
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xl">
                {unit.imageEmoji}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{unit.name}</span>
                <span className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                  {unit.datasheetName}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <button className="panel-angled flex items-center justify-center gap-2 border border-dashed border-border bg-transparent px-3 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-crimson hover:text-glow-crimson">
        <Plus className="size-4" />
        Add Unit
      </button>
    </div>
  )
}
