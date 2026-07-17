import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCrusade } from '@/lib/CrusadeContext'
import type { CrusadeUnit } from '@/types/crusade'

const EMOJI_PRESETS = ['🛡️', '⚔️', '🚀', '💥', '🎯', '💀', '🔱', '🦾', '👑', '🏹', '🛸', '🗡️']

const DATASHEET_SUGGESTIONS = [
  'Intercessor Squad', 'Assault Intercessor Squad', 'Infiltrator Squad',
  'Incursor Squad', 'Scout Squad', 'Eliminator Squad', 'Eradicator Squad',
  'Aggressor Squad', 'Terminator Squad', 'Bladeguard Veteran Squad',
  'Sternguard Veteran Squad', 'Vanguard Veteran Squad',
  'Lieutenant', 'Captain', 'Chaplain', 'Librarian', 'Techmarine', 'Apothecary',
  'Ancient', 'Company Champion', 'Judiciar',
  'Redemptor Dreadnought', 'Brutalis Dreadnought', 'Ballistus Dreadnought',
  'Repulsor', 'Repulsor Executioner', 'Gladiator Lancer', 'Gladiator Reaper',
  'Land Raider', 'Land Raider Crusader', 'Predator Annihilator', 'Vindicator',
  'Impulsor', 'Drop Pod', 'Stormraven Gunship', 'Storm Speeder Thunderstrike',
]

interface AddUnitModalProps {
  onClose: () => void
}

export function AddUnitModal({ onClose }: AddUnitModalProps) {
  const { addUnit, force, supplyUsed } = useCrusade()

  const [name, setName] = useState('')
  const [datasheetName, setDatasheetName] = useState('')
  const [pointsCost, setPointsCost] = useState('')
  const [imageEmoji, setImageEmoji] = useState('🛡️')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pts = parseInt(pointsCost, 10) || 0
  const remaining = force.supplyLimit - supplyUsed
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

    const newUnit: Omit<CrusadeUnit, 'id' | 'sortOrder'> = {
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
    }

    addUnit(newUnit)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="panel-angled w-full max-w-lg border border-border bg-card p-6">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-foreground">
              Add Unit to Roster
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Supply remaining:&nbsp;
              <span className={wouldExceed ? 'text-crimson-bright font-semibold' : 'text-foreground font-semibold'}>
                {remaining - (pts > 0 ? pts : 0)} / {force.supplyLimit} pts
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
                className={`flex size-9 items-center justify-center rounded border text-lg transition-all ${
                  imageEmoji === e
                    ? 'border-crimson bg-crimson/15 shadow-[0_0_8px_var(--crimson-glow)]'
                    : 'border-border bg-secondary hover:border-muted-foreground'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Name */}
        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Unit Name (Nickname)
          </label>
          <input
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${
              errors.name ? 'border-crimson/70' : 'border-border'
            }`}
            placeholder="e.g. Brother-Sergeant Aldric"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
          />
          {errors.name && <p className="mt-1 text-[10px] text-crimson-bright">{errors.name}</p>}
        </div>

        {/* Datasheet Name */}
        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Datasheet
          </label>
          <input
            list="datasheet-list"
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${
              errors.datasheet ? 'border-crimson/70' : 'border-border'
            }`}
            placeholder="e.g. Intercessor Squad"
            value={datasheetName}
            onChange={(e) => { setDatasheetName(e.target.value); setErrors((p) => ({ ...p, datasheet: '' })) }}
          />
          <datalist id="datasheet-list">
            {DATASHEET_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
          {errors.datasheet && <p className="mt-1 text-[10px] text-crimson-bright">{errors.datasheet}</p>}
        </div>

        {/* Points Cost */}
        <div className="mb-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Points Cost
          </label>
          <input
            type="number"
            min={1}
            className={`w-full rounded border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none ${
              errors.pts ? 'border-crimson/70' : 'border-border'
            }`}
            placeholder="e.g. 95"
            value={pointsCost}
            onChange={(e) => { setPointsCost(e.target.value); setErrors((p) => ({ ...p, pts: '' })) }}
          />
          {errors.pts && <p className="mt-1 text-[10px] text-crimson-bright">{errors.pts}</p>}
          {pts > 0 && !wouldExceed && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Supply after adding: {supplyUsed + pts} / {force.supplyLimit} pts
            </p>
          )}
          {wouldExceed && (
            <p className="mt-1 text-[10px] text-crimson-bright">
              ⚠ Exceeds Supply Limit — reduce points cost or increase Supply Limit first.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={wouldExceed}>
            Add to Roster
          </Button>
        </div>
      </div>
    </div>
  )
}
