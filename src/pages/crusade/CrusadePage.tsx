import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Plus, Swords, Users, Shield, Trash2, ChevronRight,
  AlertTriangle, X,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/lib/StoreContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Army, MissionType } from '@/types'
import { MISSION_SIZES, getRankFromXp, RANK_MAX_HONOURS } from '@/types'

const EMOJI_PRESETS = ['🛡️', '⚔️', '🚀', '💥', '🎯', '💀', '🔱', '🦾', '👑', '🏹', '🛸', '🗡️']
const DATASHEET_SUGGESTIONS = [
  'Intercessor Squad', 'Assault Intercessor Squad', 'Infiltrator Squad', 'Incursor Squad',
  'Scout Squad', 'Eliminator Squad', 'Eradicator Squad', 'Aggressor Squad',
  'Terminator Squad', 'Bladeguard Veteran Squad', 'Sternguard Veteran Squad',
  'Vanguard Veteran Squad', 'Lieutenant', 'Captain', 'Chaplain', 'Librarian',
  'Techmarine', 'Apothecary', 'Ancient', 'Company Champion', 'Judiciar',
  'Redemptor Dreadnought', 'Brutalis Dreadnought', 'Ballistus Dreadnought',
  'Repulsor', 'Repulsor Executioner', 'Gladiator Lancer', 'Gladiator Reaper',
  'Land Raider', 'Land Raider Crusader', 'Predator Annihilator', 'Vindicator',
  'Impulsor', 'Drop Pod', 'Stormraven Gunship', 'Storm Speeder Thunderstrike',
]

const RANK_COLOR: Record<string, string> = {
  'Battle-ready': 'text-muted-foreground',
  'Blooded': 'text-emerald-400',
  'Battle-hardened': 'text-yellow-400',
  'Heroic': 'text-orange-400',
  'Legendary': 'text-glow-crimson',
}

const BATTLE_PHASE_LABEL: Record<string, string> = {
  setup: 'Setup',
  in_progress: 'In Progress',
  post_battle: 'Post-Battle',
  complete: 'Complete',
}

const BATTLE_PHASE_STYLE: Record<string, string> = {
  setup: 'border-border text-muted-foreground bg-secondary',
  in_progress: 'border-crimson/50 text-crimson-bright bg-crimson/10',
  post_battle: 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10',
  complete: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
}

// ── Create Army Modal ────────────────────────────────────────────────────────

function CreateArmyModal({
  crusadeId,
  onClose,
}: {
  crusadeId: string
  onClose: () => void
}) {
  const { addArmy } = useAppStore()
  const [name, setName] = useState('')
  const [faction, setFaction] = useState('')
  const [supplyLimit, setSupplyLimit] = useState('1000')
  const [rp, setRp] = useState('5')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Army name is required.'
    if (!faction.trim()) next.faction = 'Faction is required.'
    if (!supplyLimit || parseInt(supplyLimit) < 100) next.supply = 'Enter a valid Supply Limit (min 100).'
    if (!rp || parseInt(rp) < 0) next.rp = 'Enter valid Requisition Points.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    addArmy({
      crusadeId,
      name: name.trim(),
      faction: faction.trim(),
      supplyLimit: parseInt(supplyLimit),
      requisitionPoints: parseInt(rp),
      battleTally: { battlesPlayed: 0, battlesWon: 0, battlesLost: 0, battlesDrawn: 0 },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
            Create Army
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {[
          { key: 'name', label: 'Army Name', ph: 'e.g. Iron Sons of Macragge', val: name, set: setName },
          { key: 'faction', label: 'Faction / Chapter', ph: 'e.g. Ultramarines', val: faction, set: setFaction },
        ].map(({ key, label, ph, val, set }) => (
          <div key={key} className="mb-4">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </label>
            <input
              className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors[key] ? 'border-crimson/70' : 'border-border'}`}
              placeholder={ph}
              value={val}
              onChange={(e) => { set(e.target.value); setErrors((p) => ({ ...p, [key]: '' })) }}
            />
            {errors[key] && <p className="mt-1 text-[10px] text-crimson-bright">{errors[key]}</p>}
          </div>
        ))}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Supply Limit (pts)
            </label>
            <input
              type="number"
              min={100}
              step={50}
              className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none ${errors.supply ? 'border-crimson/70' : 'border-border'}`}
              value={supplyLimit}
              onChange={(e) => { setSupplyLimit(e.target.value); setErrors((p) => ({ ...p, supply: '' })) }}
            />
            {errors.supply && <p className="mt-1 text-[10px] text-crimson-bright">{errors.supply}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Requisition Points
            </label>
            <input
              type="number"
              min={0}
              className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none ${errors.rp ? 'border-crimson/70' : 'border-border'}`}
              value={rp}
              onChange={(e) => { setRp(e.target.value); setErrors((p) => ({ ...p, rp: '' })) }}
            />
            {errors.rp && <p className="mt-1 text-[10px] text-crimson-bright">{errors.rp}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>Create Army</Button>
        </div>
      </div>
    </div>
  )
}

// ── Add Unit Modal ────────────────────────────────────────────────────────────

function AddUnitModal({
  armyId,
  supplyLimit,
  supplyUsed,
  onClose,
}: {
  armyId: string
  supplyLimit: number
  supplyUsed: number
  onClose: () => void
}) {
  const { addUnit } = useAppStore()
  const [name, setName] = useState('')
  const [datasheetName, setDatasheetName] = useState('')
  const [pointsCost, setPointsCost] = useState('')
  const [imageEmoji, setImageEmoji] = useState('🛡️')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pts = parseInt(pointsCost, 10) || 0
  const remaining = supplyLimit - supplyUsed
  const wouldExceed = pts > remaining

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Unit name is required.'
    if (!datasheetName.trim()) next.datasheet = 'Datasheet name is required.'
    if (!pointsCost || pts <= 0) next.pts = 'Enter a valid points cost.'
    if (wouldExceed) next.pts = `Exceeds Supply Limit by ${pts - remaining} pts.`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    addUnit({
      armyId,
      name: name.trim(),
      datasheetName: datasheetName.trim(),
      pointsCost: pts,
      xp: 0,
      rank: 'Battle-ready',
      crusadePoints: 0,
      battleHonours: [],
      battleScars: [],
      battleTally: { battlesParticipated: 0, unitsDestroyed: 0 },
      outOfAction: false,
      imageEmoji,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-lg border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
              Add Unit to Roster
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Supply remaining:&nbsp;
              <span className={cn('font-semibold', wouldExceed ? 'text-crimson-bright' : 'text-foreground')}>
                {remaining - (pts > 0 ? pts : 0)} / {supplyLimit} pts
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Emoji picker */}
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Unit Icon
          </p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map((e) => (
              <button
                key={e}
                onClick={() => setImageEmoji(e)}
                className={`flex size-9 items-center justify-center rounded border text-lg transition-all ${imageEmoji === e ? 'border-crimson bg-crimson/15 shadow-[0_0_8px_var(--crimson-glow)]' : 'border-border bg-secondary hover:border-muted-foreground'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Unit Name (Nickname)
          </label>
          <input
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.name ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Brother-Sergeant Aldric"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          />
          {errors.name && <p className="mt-1 text-[10px] text-crimson-bright">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Datasheet
          </label>
          <input
            list="ds-list"
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.datasheet ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. Intercessor Squad"
            value={datasheetName}
            onChange={(e) => { setDatasheetName(e.target.value); setErrors((p) => ({ ...p, datasheet: '' })) }}
          />
          <datalist id="ds-list">
            {DATASHEET_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
          {errors.datasheet && <p className="mt-1 text-[10px] text-crimson-bright">{errors.datasheet}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Points Cost
          </label>
          <input
            type="number"
            min={1}
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${errors.pts ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. 95"
            value={pointsCost}
            onChange={(e) => { setPointsCost(e.target.value); setErrors((p) => ({ ...p, pts: '' })) }}
          />
          {errors.pts && <p className="mt-1 text-[10px] text-crimson-bright">{errors.pts}</p>}
          {pts > 0 && !wouldExceed && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Supply after adding: {supplyUsed + pts} / {supplyLimit} pts
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={wouldExceed}>
            Add to Roster
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Create Battle Modal ───────────────────────────────────────────────────────

function CreateBattleModal({
  army,
  armyUnits,
  onClose,
  onCreated,
}: {
  army: Army
  armyUnits: ReturnType<typeof useAppStore>['units']
  onClose: () => void
  onCreated: (battleId: string) => void
}) {
  const { addBattle } = useAppStore()
  const [missionName, setMissionName] = useState('')
  const [missionType, setMissionType] = useState<MissionType>('Incursion')
  const [gamePts, setGamePts] = useState(1000)
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  const deployedPts = armyUnits
    .filter((u) => selectedUnitIds.has(u.id))
    .reduce((s, u) => s + u.pointsCost, 0)
  const overLimit = deployedPts > gamePts

  function toggleUnit(id: string) {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function handleMissionType(type: MissionType) {
    setMissionType(type)
    const size = MISSION_SIZES.find((m) => m.type === type)
    if (size) setGamePts(size.pts)
  }

  function handleStart() {
    if (!missionName.trim()) { setError('Mission name is required.'); return }
    if (selectedUnitIds.size === 0) { setError('Select at least one unit.'); return }
    if (overLimit) { setError('Deployed points exceed the game limit.'); return }

    const id = addBattle({
      armyId: army.id,
      missionName: missionName.trim(),
      missionType,
      gamePts,
      phase: 'setup',
      battleRound: 1,
      commandPoints: 0,
      opponentCommandPoints: 0,
      result: null,
      yourVP: 0,
      opponentVP: 0,
      units: [...selectedUnitIds].map((unitId) => ({
        unitId,
        status: 'Active',
        killsMadeThisBattle: 0,
        markedForGreatness: false,
      })),
    })
    onCreated(id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-lg border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
            New Battle
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Mission Name
          </label>
          <input
            autoFocus
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${error && !missionName.trim() ? 'border-crimson/70' : 'border-border'}`}
            placeholder="e.g. The Siege of Hive Secundus"
            value={missionName}
            onChange={(e) => { setMissionName(e.target.value); setError('') }}
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Battle Size
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MISSION_SIZES.map((m) => (
              <button
                key={m.type}
                onClick={() => handleMissionType(m.type)}
                className={cn(
                  'panel-angled flex flex-col items-center gap-1 border px-3 py-2 text-center transition-all',
                  missionType === m.type
                    ? 'border-crimson bg-crimson/10 text-crimson-bright'
                    : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground',
                )}
              >
                <span className="text-xs font-bold">{m.pts}</span>
                <span className="text-[9px] uppercase tracking-widest">{m.type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Select Units
            </label>
            <span className={cn('text-[10px] font-semibold', overLimit ? 'text-crimson-bright' : 'text-muted-foreground')}>
              {deployedPts} / {gamePts} pts
            </span>
          </div>
          {armyUnits.filter((u) => !u.outOfAction).length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No available units. Add units to your army first.</p>
          ) : (
            <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
              {armyUnits
                .filter((u) => !u.outOfAction)
                .map((u) => {
                  const checked = selectedUnitIds.has(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleUnit(u.id)}
                      className={cn(
                        'flex items-center gap-3 rounded border px-3 py-2 text-left transition-all',
                        checked
                          ? 'border-crimson/50 bg-crimson/10'
                          : 'border-border bg-secondary hover:border-muted-foreground',
                      )}
                    >
                      <span className="size-5 rounded border border-current text-center text-xs leading-5">
                        {checked ? '✓' : ''}
                      </span>
                      <span className="text-lg">{u.imageEmoji}</span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs font-semibold text-foreground">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground">{u.datasheetName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{u.pointsCost} pts</span>
                    </button>
                  )
                })}
            </div>
          )}
          {overLimit && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-crimson-bright">
              <AlertTriangle className="size-3" />
              Deployed points exceed the {gamePts} pt limit.
            </p>
          )}
        </div>

        {error && <p className="mb-3 text-[10px] text-crimson-bright">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleStart} disabled={overLimit}>
            Deploy for Battle
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main CrusadePage ──────────────────────────────────────────────────────────

export function CrusadePage() {
  const { crusadeId } = useParams<{ crusadeId: string }>()
  const navigate = useNavigate()
  const { crusades, armies, units, battles, removeCrusade, updateArmy } = useAppStore()
  const [showCreateArmy, setShowCreateArmy] = useState(false)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [showCreateBattle, setShowCreateBattle] = useState(false)
  const [pendingDeleteUnit, setPendingDeleteUnit] = useState<string | null>(null)
  const { removeUnit } = useAppStore()

  const crusade = crusades.find((c) => c.id === crusadeId)
  const army = armies.find((a) => a.crusadeId === crusadeId)
  const armyUnits = army
    ? units.filter((u) => u.armyId === army.id).sort((a, b) => a.sortOrder - b.sortOrder)
    : []
  const armyBattles = army
    ? battles.filter((b) => b.armyId === army.id).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : []

  const supplyUsed = armyUnits.filter((u) => !u.outOfAction).reduce((s, u) => s + u.pointsCost, 0)

  if (!crusade) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Crusade not found.</p>
          <Button onClick={() => navigate('/crusades')}>Back to Crusades</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Crusades', href: '/crusades' },
        { label: crusade.name },
      ]}
    >
      {showCreateArmy && (
        <CreateArmyModal crusadeId={crusade.id} onClose={() => setShowCreateArmy(false)} />
      )}
      {showAddUnit && army && (
        <AddUnitModal
          armyId={army.id}
          supplyLimit={army.supplyLimit}
          supplyUsed={supplyUsed}
          onClose={() => setShowAddUnit(false)}
        />
      )}
      {showCreateBattle && army && (
        <CreateBattleModal
          army={army}
          armyUnits={armyUnits}
          onClose={() => setShowCreateBattle(false)}
          onCreated={(battleId) => {
            setShowCreateBattle(false)
            navigate(`/crusades/${crusadeId}/battles/${battleId}`)
          }}
        />
      )}

      {/* Crusade header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
            {crusade.name}
          </h1>
          {crusade.description && (
            <p className="mt-1 text-sm text-muted-foreground">{crusade.description}</p>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm(`Remove "${crusade.name}" and all its data?`)) {
              removeCrusade(crusade.id)
              navigate('/crusades')
            }
          }}
          className="shrink-0 rounded p-1.5 text-muted-foreground/40 hover:text-crimson-bright"
          title="Delete crusade"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* ── Army section ── */}
      {!army ? (
        <div className="panel-angled mb-8 flex flex-col items-center gap-4 border border-dashed border-border bg-card/50 py-12 text-center">
          <Shield className="size-10 text-muted-foreground/30" />
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            No army yet. Build your Crusade Force.
          </p>
          <Button onClick={() => setShowCreateArmy(true)} className="gap-2">
            <Plus className="size-4" />
            Create Army
          </Button>
        </div>
      ) : (
        <>
          {/* Army header */}
          <div className="panel-angled mb-6 border border-border bg-card p-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-crimson-bright" />
                  <span className="text-base font-bold uppercase tracking-widest text-foreground">
                    {army.name}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{army.faction}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* Supply bar */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Supply</span>
                  <span className="text-sm font-bold text-foreground">
                    {supplyUsed}
                    <span className="text-xs font-normal text-muted-foreground"> / {army.supplyLimit}</span>
                  </span>
                </div>

                {/* RP */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">RP</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateArmy(army.id, { requisitionPoints: Math.max(0, army.requisitionPoints - 1) })}
                      className="rounded px-1 text-muted-foreground hover:text-foreground"
                    >−</button>
                    <span className="w-6 text-center text-sm font-bold text-crimson-bright">
                      {army.requisitionPoints}
                    </span>
                    <button
                      onClick={() => updateArmy(army.id, { requisitionPoints: army.requisitionPoints + 1 })}
                      className="rounded px-1 text-muted-foreground hover:text-foreground"
                    >+</button>
                  </div>
                </div>

                {/* W/L/D */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Record</span>
                  <span className="text-sm font-bold">
                    <span className="text-emerald-400">{army.battleTally.battlesWon}W</span>
                    {' / '}
                    <span className="text-crimson-bright">{army.battleTally.battlesLost}L</span>
                    {' / '}
                    <span className="text-yellow-400">{army.battleTally.battlesDrawn}D</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Units grid ── */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <Users className="size-4 text-crimson-bright" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Roster
              </h2>
              <span className="text-xs text-muted-foreground">
                {armyUnits.length} {armyUnits.length === 1 ? 'unit' : 'units'}
              </span>
              <div className="h-px flex-1 bg-border" />
              <button
                onClick={() => setShowAddUnit(true)}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-glow-crimson"
              >
                <Plus className="size-3" />
                Add Unit
              </button>
            </div>

            {armyUnits.length === 0 ? (
              <div className="panel-angled flex flex-col items-center gap-4 border border-dashed border-border bg-card/50 py-10 text-center">
                <span className="text-3xl opacity-30">⚔️</span>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  No units yet. Build your force.
                </p>
                <button
                  onClick={() => setShowAddUnit(true)}
                  className="panel-angled border border-dashed border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
                >
                  + Add First Unit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {armyUnits.map((unit) => {
                  const rank = getRankFromXp(unit.xp)
                  const maxHonours = RANK_MAX_HONOURS[rank]
                  const isPendingDelete = pendingDeleteUnit === unit.id

                  if (isPendingDelete) {
                    return (
                      <div key={unit.id} className="panel-angled flex flex-col gap-2 border border-crimson/50 bg-crimson/10 p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Remove <span className="text-crimson-bright">{unit.name}</span>?
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          This permanently removes the unit and all records.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPendingDeleteUnit(null)}
                            className="flex-1 rounded border border-border py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-muted-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { removeUnit(unit.id); setPendingDeleteUnit(null) }}
                            className="flex-1 rounded border border-crimson/50 bg-crimson/10 py-1 text-[10px] font-semibold uppercase tracking-widest text-crimson-bright hover:bg-crimson/20"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={unit.id} className={cn('group relative', unit.outOfAction && 'opacity-60')}>
                      <Link
                        to={`/crusades/${crusadeId}/units/${unit.id}`}
                        className="panel-angled flex gap-3 border border-border bg-card p-3 transition-all hover:border-muted-foreground"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xl">
                          {unit.imageEmoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {unit.name}
                            </span>
                            {unit.outOfAction && (
                              <span className="shrink-0 rounded border border-crimson/50 bg-crimson/10 px-1 py-px text-[8px] font-bold uppercase tracking-widest text-crimson-bright">
                                OOA
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[10px] text-muted-foreground">{unit.datasheetName}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className={cn('text-[10px] font-semibold uppercase tracking-widest', RANK_COLOR[rank])}>
                              {rank}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{unit.xp} XP</span>
                            {unit.crusadePoints > 0 && (
                              <span className="rounded border border-crimson/40 bg-crimson/10 px-1 py-px text-[8px] font-bold text-crimson-bright">
                                {unit.crusadePoints} CP
                              </span>
                            )}
                          </div>
                          {maxHonours > 0 && (
                            <div className="mt-1.5 flex gap-0.5">
                              {Array.from({ length: maxHonours }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'h-1 flex-1 rounded-sm',
                                    i < unit.battleHonours.length
                                      ? 'bg-yellow-400'
                                      : 'bg-border',
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground/40 group-hover:text-muted-foreground" />
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); setPendingDeleteUnit(unit.id) }}
                        className="absolute right-1 top-1 hidden size-6 items-center justify-center rounded text-muted-foreground/40 hover:text-crimson-bright group-hover:flex"
                        title="Remove unit"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )
                })}

                <button
                  onClick={() => setShowAddUnit(true)}
                  className="panel-angled flex min-h-[80px] items-center justify-center gap-2 border border-dashed border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
                >
                  <Plus className="size-4" />
                  Add Unit
                </button>
              </div>
            )}
          </div>

          {/* ── Battles section ── */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Swords className="size-4 text-crimson-bright" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Battles
              </h2>
              <span className="text-xs text-muted-foreground">{armyBattles.length}</span>
              <div className="h-px flex-1 bg-border" />
              <button
                onClick={() => setShowCreateBattle(true)}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-glow-crimson"
              >
                <Plus className="size-3" />
                New Battle
              </button>
            </div>

            {armyBattles.length === 0 ? (
              <div className="panel-angled flex flex-col items-center gap-4 border border-dashed border-border bg-card/50 py-10 text-center">
                <Swords className="size-8 text-muted-foreground/20" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  No battles yet. Glory awaits.
                </p>
                {armyUnits.length > 0 && (
                  <button
                    onClick={() => setShowCreateBattle(true)}
                    className="panel-angled border border-dashed border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
                  >
                    + Begin a Battle
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {armyBattles.map((battle) => {
                  const date = new Date(battle.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  return (
                    <Link
                      key={battle.id}
                      to={`/crusades/${crusadeId}/battles/${battle.id}`}
                      className="panel-angled group flex flex-wrap items-center gap-4 border border-border bg-card px-4 py-3 transition-all hover:border-muted-foreground"
                    >
                      <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest', BATTLE_PHASE_STYLE[battle.phase])}>
                        {battle.result && battle.phase === 'complete'
                          ? battle.result
                          : BATTLE_PHASE_LABEL[battle.phase]}
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {battle.missionName}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {battle.missionType} · {battle.gamePts} pts · {battle.units.length} units
                        </span>
                      </div>

                      {battle.phase === 'complete' && battle.result && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-foreground">
                            <span className="font-bold">{battle.yourVP}</span>
                            <span className="text-muted-foreground"> VP</span>
                          </span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="text-foreground">
                            <span className="font-bold">{battle.opponentVP}</span>
                            <span className="text-muted-foreground"> VP</span>
                          </span>
                        </div>
                      )}

                      <span className="text-[10px] text-muted-foreground">{date}</span>
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                    </Link>
                  )
                })}

                <button
                  onClick={() => setShowCreateBattle(true)}
                  className="panel-angled flex items-center justify-center gap-2 border border-dashed border-border bg-transparent py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-crimson hover:text-glow-crimson"
                >
                  <Plus className="size-4" />
                  New Battle
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  )
}
