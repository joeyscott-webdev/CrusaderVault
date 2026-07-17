import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/lib/StoreContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getRankFromXp, xpForNextRank, RANK_MAX_HONOURS,
  BATTLE_HONOUR_TYPES, type BattleHonourType,
} from '@/types'

const RANK_COLOR: Record<string, string> = {
  'Battle-ready': 'text-muted-foreground',
  'Blooded': 'text-emerald-400',
  'Battle-hardened': 'text-yellow-400',
  'Heroic': 'text-orange-400',
  'Legendary': 'text-glow-crimson',
}

function AddHonourModal({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, type: BattleHonourType, description: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<BattleHonourType>('Battle Trait')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Honour name is required.'
    if (!description.trim()) next.description = 'Rules text is required.'
    if (Object.keys(next).length > 0) { setErrors(next); return }
    onAdd(name.trim(), type, description.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
            Add Battle Honour
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Honour Name
          </label>
          <input
            autoFocus
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.name ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Headhunter"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          />
          {errors.name && <p className="mt-1 text-[10px] text-crimson-bright">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Honour Type
          </label>
          <select
            className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none"
            value={type}
            onChange={(e) => setType(e.target.value as BattleHonourType)}
          >
            {BATTLE_HONOUR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Rules Text
          </label>
          <textarea
            className={`w-full resize-none rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.description ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Each time this unit makes an attack, re-roll a hit roll of 1."
            rows={3}
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })) }}
          />
          {errors.description && <p className="mt-1 text-[10px] text-crimson-bright">{errors.description}</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>Add Honour</Button>
        </div>
      </div>
    </div>
  )
}

function AddScarModal({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, effect: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [effect, setEffect] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Scar name is required.'
    if (!effect.trim()) next.effect = 'Rules text is required.'
    if (Object.keys(next).length > 0) { setErrors(next); return }
    onAdd(name.trim(), effect.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
            Add Battle Scar
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Scar Name
          </label>
          <input
            autoFocus
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.name ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Damaged Targeting Array"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          />
          {errors.name && <p className="mt-1 text-[10px] text-crimson-bright">{errors.name}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Rules Text
          </label>
          <textarea
            className={`w-full resize-none rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.effect ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Subtract 1 from this unit's hit rolls."
            rows={3}
            value={effect}
            onChange={(e) => { setEffect(e.target.value); setErrors((p) => ({ ...p, effect: '' })) }}
          />
          {errors.effect && <p className="mt-1 text-[10px] text-crimson-bright">{errors.effect}</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>Add Scar</Button>
        </div>
      </div>
    </div>
  )
}

export function UnitPage() {
  const { crusadeId, unitId } = useParams<{ crusadeId: string; unitId: string }>()
  const navigate = useNavigate()
  const { crusades, armies, units, updateUnit, removeUnit } = useAppStore()
  const [showAddHonour, setShowAddHonour] = useState(false)
  const [showAddScar, setShowAddScar] = useState(false)

  const crusade = crusades.find((c) => c.id === crusadeId)
  const unit = units.find((u) => u.id === unitId)
  const army = armies.find((a) => a.id === unit?.armyId)

  if (!unit || !crusade) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Unit not found.</p>
          <Button onClick={() => navigate(`/crusades/${crusadeId}`)}>Back to Crusade</Button>
        </div>
      </AppShell>
    )
  }

  const u = unit
  const rank = getRankFromXp(u.xp)
  const maxHonours = RANK_MAX_HONOURS[rank]
  const nextRankXp = xpForNextRank(rank)
  const canAddHonour = u.battleHonours.length < maxHonours

  function addXp(amount: number) {
    const newXp = Math.max(0, u.xp + amount)
    const newRank = getRankFromXp(newXp)
    updateUnit(u.id, { xp: newXp, rank: newRank })
  }

  function addHonour(name: string, type: BattleHonourType, description: string) {
    const honour = { id: `hon-${Date.now()}`, name, type, description }
    updateUnit(u.id, {
      battleHonours: [...u.battleHonours, honour],
      crusadePoints: u.crusadePoints + 1,
    })
  }

  function removeHonour(id: string) {
    updateUnit(u.id, {
      battleHonours: u.battleHonours.filter((h) => h.id !== id),
      crusadePoints: Math.max(0, u.crusadePoints - 1),
    })
  }

  function addScar(name: string, effect: string) {
    const scar = { id: `scar-${Date.now()}`, name, effect }
    updateUnit(u.id, { battleScars: [...u.battleScars, scar] })
  }

  function removeScar(id: string) {
    updateUnit(u.id, { battleScars: u.battleScars.filter((s) => s.id !== id) })
  }

  function toggleOoa() {
    updateUnit(u.id, { outOfAction: !u.outOfAction })
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Crusades', href: '/crusades' },
        { label: crusade.name, href: `/crusades/${crusadeId}` },
        { label: u.name },
      ]}
    >
      {showAddHonour && (
        <AddHonourModal onAdd={addHonour} onClose={() => setShowAddHonour(false)} />
      )}
      {showAddScar && (
        <AddScarModal onAdd={addScar} onClose={() => setShowAddScar(false)} />
      )}

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary text-3xl shadow-[0_0_24px_var(--crimson-glow)]">
          {u.imageEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
              {u.name}
            </h1>
            {u.outOfAction && (
              <span className="rounded border border-crimson/50 bg-crimson/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-crimson-bright">
                Out of Action
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{u.datasheetName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {army?.name} · {u.pointsCost} pts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOoa}
            className={cn(
              'rounded border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors',
              u.outOfAction
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-crimson/50 bg-crimson/10 text-crimson-bright hover:bg-crimson/20',
            )}
          >
            {u.outOfAction ? 'Recover' : 'Mark OOA'}
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${u.name}"?`)) {
                removeUnit(u.id)
                navigate(`/crusades/${crusadeId}`)
              }
            }}
            className="rounded p-1.5 text-muted-foreground/40 hover:text-crimson-bright"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left column — honours & scars */}
        <div className="flex flex-col gap-6">
          {/* Battle Honours */}
          <div className="panel-angled border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-4 bg-yellow-400/60" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                Battle Honours
              </h2>
              <div className="h-px flex-1 bg-yellow-400/20" />
              <span className="text-[10px] text-muted-foreground">
                {u.battleHonours.length} / {maxHonours}
              </span>
              {canAddHonour ? (
                <button
                  onClick={() => setShowAddHonour(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-yellow-400/70 hover:text-yellow-400"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              ) : rank === 'Battle-ready' ? (
                <span className="text-[10px] text-muted-foreground/50">
                  Rank up first
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/50">Slots full</span>
              )}
            </div>

            {/* Honour slot pips */}
            {maxHonours > 0 && (
              <div className="mb-3 flex gap-1">
                {Array.from({ length: maxHonours }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-sm transition-colors',
                      i < u.battleHonours.length ? 'bg-yellow-400' : 'bg-border',
                    )}
                  />
                ))}
              </div>
            )}

            {u.battleHonours.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {rank === 'Battle-ready'
                  ? 'Earn 3 XP to reach Blooded rank and unlock Battle Honours.'
                  : 'No honours yet. Award one after a battle.'}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {u.battleHonours.map((h) => (
                  <div key={h.id} className="group relative rounded border border-yellow-400/20 bg-yellow-400/5 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400/70">
                        {h.type}
                      </span>
                      <span className="text-xs font-bold text-yellow-400">{h.name}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/80">{h.description}</p>
                    <button
                      onClick={() => removeHonour(h.id)}
                      className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground/40 hover:text-crimson-bright group-hover:block"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Battle Scars */}
          <div className="panel-angled border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-4 bg-crimson/60" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-crimson-bright">
                Battle Scars
              </h2>
              <div className="h-px flex-1 bg-crimson/20" />
              <button
                onClick={() => setShowAddScar(true)}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-crimson-bright/70 hover:text-crimson-bright"
              >
                <Plus className="size-3" />
                Add
              </button>
            </div>

            {u.battleScars.length === 0 ? (
              <p className="text-xs text-muted-foreground">No battle scars. Glory without wounds.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {u.battleScars.map((s) => (
                  <div key={s.id} className="group relative rounded border border-crimson/20 bg-crimson/5 p-3">
                    <p className="mb-1 text-xs font-bold text-crimson-bright">{s.name}</p>
                    <p className="text-[11px] leading-relaxed text-foreground/80">{s.effect}</p>
                    <button
                      onClick={() => removeScar(s.id)}
                      className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground/40 hover:text-crimson-bright group-hover:block"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — stats */}
        <div className="flex flex-col gap-4">
          {/* Rank & XP */}
          <div className="panel-angled border border-border bg-card p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Rank
            </p>
            <p className={cn('text-lg font-black uppercase tracking-widest', RANK_COLOR[rank])}>
              {rank}
            </p>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Experience
                </span>
                <span className="text-[10px] font-semibold text-foreground">
                  {u.xp} XP
                  {rank !== 'Legendary' && (
                    <span className="text-muted-foreground"> / {nextRankXp}</span>
                  )}
                </span>
              </div>
              {rank !== 'Legendary' && (
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-crimson transition-all"
                    style={{ width: `${Math.min(100, (u.xp / nextRankXp) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => addXp(-1)}
                disabled={u.xp === 0}
                className="flex-1 rounded border border-border py-1.5 text-xs font-semibold text-muted-foreground hover:border-muted-foreground disabled:opacity-30"
              >
                −1 XP
              </button>
              <button
                onClick={() => addXp(1)}
                className="flex-1 rounded border border-border py-1.5 text-xs font-semibold text-muted-foreground hover:border-muted-foreground"
              >
                +1 XP
              </button>
              <button
                onClick={() => addXp(3)}
                className="flex-1 rounded border border-crimson/40 bg-crimson/10 py-1.5 text-xs font-semibold text-crimson-bright hover:bg-crimson/20"
              >
                +3 XP
              </button>
            </div>
          </div>

          {/* Stats tiles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="panel-angled border border-border bg-card p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Crusade Pts</p>
              <p className="mt-1 text-xl font-black text-crimson-bright">{u.crusadePoints}</p>
            </div>
            <div className="panel-angled border border-border bg-card p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Points Cost</p>
              <p className="mt-1 text-xl font-black text-foreground">{u.pointsCost}</p>
            </div>
            <div className="panel-angled border border-border bg-card p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Battles</p>
              <p className="mt-1 text-xl font-black text-foreground">
                {u.battleTally.battlesParticipated}
              </p>
            </div>
            <div className="panel-angled border border-border bg-card p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Kills</p>
              <p className="mt-1 text-xl font-black text-foreground">
                {u.battleTally.unitsDestroyed}
              </p>
            </div>
          </div>

          {/* Back link */}
          <Link
            to={`/crusades/${crusadeId}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to {crusade.name}
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
