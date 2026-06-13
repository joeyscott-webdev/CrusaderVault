import type { SampleUnit } from '@/data/sampleUnits'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface UnitStatsPanelProps {
  unit: SampleUnit
}

export function UnitStatsPanel({ unit }: UnitStatsPanelProps) {
  return (
    <div className="panel-angled flex h-full flex-col gap-6 border border-border bg-card px-5 py-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Rank</p>
        <p className="text-3xl font-bold text-glow-crimson">{unit.rank}</p>
      </div>

      <div className="flex flex-col gap-4">
        {unit.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-semibold text-foreground">{stat.value}</span>
            </div>
            <Progress value={(stat.value / stat.max) * 100} />
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest">
          <span className="text-muted-foreground">XP</span>
          <span className="font-semibold text-foreground">{unit.xp}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-xs uppercase tracking-widest">
          <span className="text-muted-foreground">Points Cost</span>
          <span className="font-semibold text-foreground">{unit.pointsCost}</span>
        </div>

        <Button size="lg" className="mt-2 w-full">
          Enter Game Mode
        </Button>
      </div>
    </div>
  )
}
