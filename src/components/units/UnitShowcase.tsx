import type { CrusadeUnit } from '@/types/crusade'

const HONOUR_TYPE_COLOR: Record<string, string> = {
  'Battle Trait': 'text-yellow-400',
  'Weapon Enhancement': 'text-blue-400',
  'Crusade Relic': 'text-purple-400',
  'Epic Deed': 'text-orange-400',
  'Warlord Trait': 'text-crimson-bright',
}

interface UnitShowcaseProps {
  unit: CrusadeUnit
}

export function UnitShowcase({ unit }: UnitShowcaseProps) {
  return (
    <div className="panel-angled relative flex h-full flex-col overflow-hidden border border-border bg-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, var(--crimson-glow), transparent 55%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 text-center">
        <div className="flex size-28 items-center justify-center rounded-full border border-glow-crimson bg-secondary text-5xl">
          {unit.imageEmoji}
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-bold uppercase tracking-widest text-foreground">
            {unit.name}
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {unit.datasheetName}
          </p>
          {unit.crusadePoints > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 rounded border border-crimson/40 bg-crimson/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-crimson-bright">
              ⬟ {unit.crusadePoints} Crusade{unit.crusadePoints === 1 ? ' Point' : ' Points'}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 overflow-y-auto px-6 pb-6">
        {unit.battleHonours.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-400">
                Battle Honours
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              {unit.battleHonours.map((honour) => (
                <div
                  key={honour.id}
                  className="panel-angled border border-yellow-400/20 bg-yellow-400/5 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                      {honour.name}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-widest ${HONOUR_TYPE_COLOR[honour.type]}`}
                    >
                      {honour.type}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {honour.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {unit.battleScars.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-crimson-bright">
                Battle Scars
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-2">
              {unit.battleScars.map((scar) => (
                <div
                  key={scar.id}
                  className="panel-angled border border-crimson/30 bg-crimson/5 px-3 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-crimson-bright">
                    {scar.name}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {scar.effect}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {unit.battleHonours.length === 0 && unit.battleScars.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="text-2xl opacity-30">⚔️</span>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              No battle honours yet. Glory awaits.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
