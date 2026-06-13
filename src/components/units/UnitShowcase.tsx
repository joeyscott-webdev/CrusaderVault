import type { SampleUnit } from '@/data/sampleUnits'
import { Badge } from '@/components/ui/badge'

interface UnitShowcaseProps {
  unit: SampleUnit
}

export function UnitShowcase({ unit }: UnitShowcaseProps) {
  return (
    <div className="panel-angled relative flex h-full flex-col items-center justify-center overflow-hidden border border-border bg-card px-6 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, var(--crimson-glow), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex size-40 items-center justify-center rounded-full border border-glow-crimson bg-secondary text-6xl">
          {unit.imageEmoji}
        </div>

        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-foreground">
            {unit.name}
          </h1>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {unit.datasheetName}
          </p>
        </div>

        <div className="flex gap-2">
          {unit.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
