import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Swords, Users, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/lib/StoreContext'
import { Button } from '@/components/ui/button'

function CreateCrusadeModal({ onClose }: { onClose: () => void }) {
  const { addCrusade } = useAppStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) { setError('Crusade name is required.'); return }
    addCrusade({ name: name.trim(), description: description.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
            New Crusade
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Crusade Name
          </label>
          <input
            autoFocus
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${error ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. The Siege of Armageddon"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="mt-1 text-[10px] text-crimson-bright">{error}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Description <span className="normal-case text-muted-foreground/50">(optional)</span>
          </label>
          <textarea
            className="w-full resize-none rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none"
            placeholder="A brief description of this campaign..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>Create Crusade</Button>
        </div>
      </div>
    </div>
  )
}

export function CrusadesPage() {
  const { crusades, armies, units, battles } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <AppShell breadcrumbs={[{ label: 'Crusades' }]}>
      {showCreate && <CreateCrusadeModal onClose={() => setShowCreate(false)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-widest text-foreground">
            My Crusades
          </h1>
          <p className="text-xs text-muted-foreground">
            {crusades.length === 0
              ? 'No campaigns yet — start your first crusade.'
              : `${crusades.length} active ${crusades.length === 1 ? 'campaign' : 'campaigns'}`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="size-4" />
          New Crusade
        </Button>
      </div>

      {crusades.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="text-5xl opacity-30">⚔️</span>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            No crusades yet. Glory awaits.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="panel-angled border border-dashed border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
          >
            + Begin a Crusade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crusades.map((c) => {
            const army = armies.find((a) => a.crusadeId === c.id)
            const armyUnits = units.filter((u) => u.armyId === army?.id)
            const completedBattles = battles.filter(
              (b) => b.armyId === army?.id && b.phase === 'complete',
            )
            const wins = completedBattles.filter((b) => b.result === 'Win').length
            const losses = completedBattles.filter((b) => b.result === 'Loss').length
            const draws = completedBattles.filter((b) => b.result === 'Draw').length

            return (
              <Link
                key={c.id}
                to={`/crusades/${c.id}`}
                className="panel-angled group flex flex-col gap-3 border border-border bg-card p-4 transition-all hover:border-muted-foreground"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-foreground">{c.name}</h2>
                    {c.description && (
                      <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </div>

                {army ? (
                  <>
                    <div className="h-px bg-border" />
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {army.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="size-3" />
                        {armyUnits.length} {armyUnits.length === 1 ? 'unit' : 'units'}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Swords className="size-3" />
                        {completedBattles.length} battles
                      </span>
                    </div>
                    {completedBattles.length > 0 && (
                      <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-emerald-400">{wins}W</span>
                        <span className="text-crimson-bright">{losses}L</span>
                        <span className="text-yellow-400">{draws}D</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    No army yet
                  </div>
                )}
              </Link>
            )
          })}

          {/* Add card */}
          <button
            onClick={() => setShowCreate(true)}
            className="panel-angled flex min-h-[120px] items-center justify-center gap-2 border border-dashed border-border bg-transparent text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-crimson hover:text-glow-crimson"
          >
            <Plus className="size-4" />
            New Crusade
          </button>
        </div>
      )}
    </AppShell>
  )
}
