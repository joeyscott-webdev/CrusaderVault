import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Swords, Star, ChevronRight,
  Plus, Minus, Check, ArrowLeft, Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/lib/StoreContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getRankFromXp, calcBattleXp, RANK_MAX_HONOURS,
  BATTLE_HONOUR_TYPES, type BattleUnitStatus, type BattleResult,
  type BattleHonourType,
} from '@/types'

// ── Status cycle ──────────────────────────────────────────────────────────────

const STATUS_ORDER: BattleUnitStatus[] = ['Active', 'Battle-shocked', 'Destroyed', 'Out of Action']

const STATUS_STYLE: Record<BattleUnitStatus, string> = {
  Active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  'Battle-shocked': 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400',
  Destroyed: 'border-muted-foreground/40 bg-secondary text-muted-foreground',
  'Out of Action': 'border-crimson/50 bg-crimson/10 text-crimson-bright',
}

function cycleStatus(current: BattleUnitStatus): BattleUnitStatus {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

// ── MFG Seal Pop-and-Fly Overlay ──────────────────────────────────────────────

function MfgSealOverlay({ targetRect, onDone }: { targetRect: DOMRect; onDone: () => void }) {
  const [animState, setAnimState] = useState<'pop' | 'fly'>('pop')
  const [visible, setVisible] = useState(false)

  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const tx = targetRect.right - 40 - cx
  const ty = targetRect.top + 40 - cy

  useEffect(() => {
    const ra = requestAnimationFrame(() => setVisible(true))
    const t1 = setTimeout(() => setAnimState('fly'), 900)
    const t2 = setTimeout(onDone, 1500)
    return () => { cancelAnimationFrame(ra); clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  const sealStyle: React.CSSProperties =
    animState === 'pop'
      ? {
          transform: `scale(${visible ? 1 : 0}) rotate(${visible ? 0 : -15}deg)`,
          opacity: visible ? 1 : 0,
          transition: visible
            ? 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease'
            : 'none',
        }
      : {
          transform: `translate(${tx}px, ${ty}px) scale(0.13) rotate(5deg)`,
          opacity: 0.9,
          transition: 'transform 550ms cubic-bezier(0.4, 0, 0.2, 1), opacity 550ms ease',
        }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ opacity: animState === 'pop' ? 1 : 0, transition: 'opacity 500ms ease' }}
      />
      <div
        className="absolute size-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, oklch(0.58 0.22 25 / 0.3) 0%, transparent 70%)',
          opacity: animState === 'pop' && visible ? 1 : 0,
          transition: 'opacity 500ms ease',
        }}
      />
      <img
        src="/mfg-seal.png"
        alt="Marked for Greatness"
        className="w-72 h-72 object-contain"
        style={sealStyle}
      />
    </div>
  )
}

// ── In-Progress Unit Card ─────────────────────────────────────────────────────

function UnitBattleCard({
  battleUnit,
  unit,
  mfgTaken: mfgTakenByAnother,
  onUpdate,
  onMfgActivated,
}: {
  battleUnit: { unitId: string; status: BattleUnitStatus; killsMadeThisBattle: number; markedForGreatness: boolean }
  unit: { name: string; imageEmoji: string; datasheetName: string; battleHonours: Array<{ id: string; name: string; type: string; description: string }>; battleScars: Array<{ id: string; name: string; effect: string }> }
  mfgTaken: boolean
  onUpdate: (patch: Partial<typeof battleUnit>) => void
  onMfgActivated: (rect: DOMRect) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={cardRef}>
      {battleUnit.markedForGreatness && (
        <div className="absolute -top-4 -right-4 z-20 pointer-events-none">
          <img
            src="/mfg-seal.png"
            alt=""
            className="w-14 h-14 object-contain drop-shadow-lg animate-seal-badge"
          />
        </div>
      )}
      <div className={cn('panel-angled border bg-card', STATUS_STYLE[battleUnit.status])}>
      <div className="p-3">
        {/* Unit header */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-xl">
            {unit.imageEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{unit.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{unit.datasheetName}</p>
          </div>
        </div>

        {/* Status toggle */}
        <button
          onClick={() => onUpdate({ status: cycleStatus(battleUnit.status) })}
          className={cn(
            'mb-3 w-full rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-all',
            STATUS_STYLE[battleUnit.status],
          )}
        >
          {battleUnit.status}
        </button>

        {/* Kills counter */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Kills</span>
            <span className="ml-1 text-[9px] text-muted-foreground/50">(3=1xp)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate({ killsMadeThisBattle: Math.max(0, battleUnit.killsMadeThisBattle - 1) })}
              disabled={battleUnit.killsMadeThisBattle === 0}
              className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground disabled:opacity-30"
            >
              <Minus className="size-3" />
            </button>
            <div className="flex w-10 flex-col items-center">
              <span className="text-sm font-bold text-foreground leading-none">
                {battleUnit.killsMadeThisBattle}
              </span>
              {battleUnit.killsMadeThisBattle > 0 && (
                <span className="text-[8px] text-crimson-bright/70">
                  +{Math.floor(battleUnit.killsMadeThisBattle / 3)}xp
                </span>
              )}
            </div>
            <button
              onClick={() => onUpdate({ killsMadeThisBattle: battleUnit.killsMadeThisBattle + 1 })}
              className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </div>

        {/* Mark for Greatness */}
        <button
          onClick={() => {
            if (!battleUnit.markedForGreatness && mfgTakenByAnother) return
            const willMark = !battleUnit.markedForGreatness
            onUpdate({ markedForGreatness: willMark })
            if (willMark && cardRef.current) {
              onMfgActivated(cardRef.current.getBoundingClientRect())
            }
          }}
          disabled={!battleUnit.markedForGreatness && mfgTakenByAnother}
          className={cn(
            'flex w-full items-center justify-center gap-1.5 rounded border py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all',
            battleUnit.markedForGreatness
              ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
              : mfgTakenByAnother
                ? 'border-border text-muted-foreground/30 cursor-not-allowed'
                : 'border-border text-muted-foreground hover:border-yellow-400/50 hover:text-yellow-400',
          )}
        >
          <Star className={cn('size-3', battleUnit.markedForGreatness && 'fill-yellow-400')} />
          {battleUnit.markedForGreatness ? 'Marked for Greatness' : 'Mark for Greatness'}
        </button>

        {/* Toggle details */}
        {(unit.battleHonours.length > 0 || unit.battleScars.length > 0) && (
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground"
          >
            {showDetails ? 'Hide' : 'Show'} abilities
            <ChevronRight className={cn('size-3 transition-transform', showDetails && 'rotate-90')} />
          </button>
        )}
      </div>

      {showDetails && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          {unit.battleHonours.map((h) => (
            <div key={h.id} className="mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-yellow-400/70">
                {h.type} — {h.name}
              </p>
              <p className="text-[10px] leading-relaxed text-foreground/70">{h.description}</p>
            </div>
          ))}
          {unit.battleScars.map((s) => (
            <div key={s.id} className="mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-crimson-bright/70">
                Scar — {s.name}
              </p>
              <p className="text-[10px] leading-relaxed text-foreground/70">{s.effect}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

// ── Post-Battle AAR ───────────────────────────────────────────────────────────

interface AarHonour {
  name: string
  type: BattleHonourType
  description: string
}

interface AarScar {
  name: string
  effect: string
}

interface AarUnit {
  grantHonour: boolean
  honour: AarHonour
  grantScar: boolean
  scar: AarScar
}

function PostBattleAAR({
  battle,
  allUnits,
  onComplete,
}: {
  battle: ReturnType<typeof useAppStore>['battles'][0]
  allUnits: ReturnType<typeof useAppStore>['units']
  onComplete: (result: BattleResult, yourVP: number, opponentVP: number, aarData: Record<string, AarUnit>) => void
}) {
  const [result, setResult] = useState<BattleResult>('Win')
  const [yourVP, setYourVP] = useState(battle.yourVP)
  const [opponentVP, setOpponentVP] = useState(battle.opponentVP)
  const [aarData, setAarData] = useState<Record<string, AarUnit>>(() => {
    const init: Record<string, AarUnit> = {}
    battle.units.forEach((bu) => {
      init[bu.unitId] = {
        grantHonour: false,
        honour: { name: '', type: 'Battle Trait', description: '' },
        grantScar: bu.status === 'Out of Action',
        scar: { name: '', effect: '' },
      }
    })
    return init
  })

  function updateAar(unitId: string, patch: Partial<AarUnit>) {
    setAarData((prev) => ({ ...prev, [unitId]: { ...prev[unitId], ...patch } }))
  }

  function updateHonour(unitId: string, patch: Partial<AarHonour>) {
    setAarData((prev) => ({
      ...prev,
      [unitId]: { ...prev[unitId], honour: { ...prev[unitId].honour, ...patch } },
    }))
  }

  function updateScar(unitId: string, patch: Partial<AarScar>) {
    setAarData((prev) => ({
      ...prev,
      [unitId]: { ...prev[unitId], scar: { ...prev[unitId].scar, ...patch } },
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Result & VP */}
      <div className="panel-angled border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">
          Battle Outcome
        </h2>

        <div className="mb-4 flex gap-3">
          {(['Win', 'Loss', 'Draw'] as BattleResult[]).map((r) => (
            <button
              key={r}
              onClick={() => setResult(r)}
              className={cn(
                'flex-1 rounded border py-2 text-xs font-bold uppercase tracking-widest transition-all',
                result === r
                  ? r === 'Win'
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                    : r === 'Loss'
                      ? 'border-crimson/50 bg-crimson/15 text-crimson-bright'
                      : 'border-yellow-400/50 bg-yellow-400/15 text-yellow-400'
                  : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Your Victory Points
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none"
              value={yourVP}
              onChange={(e) => setYourVP(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Opponent Victory Points
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none"
              value={opponentVP}
              onChange={(e) => setOpponentVP(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Per-unit AAR */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground">
          Unit After-Action Report
        </h2>
        <div className="flex flex-col gap-3">
          {battle.units.map((bu) => {
            const unit = allUnits.find((u) => u.id === bu.unitId)
            if (!unit) return null
            const xpGained = calcBattleXp(bu)
            const newXp = unit.xp + xpGained
            const newRank = getRankFromXp(newXp)
            const maxHonours = RANK_MAX_HONOURS[newRank]
            const canHonour = newRank !== 'Battle-ready' && unit.battleHonours.length < maxHonours
            const aar = aarData[bu.unitId]

            return (
              <div key={bu.unitId} className="panel-angled border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xl">{unit.imageEmoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{unit.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {bu.status === 'Out of Action' ? (
                        <span className="text-crimson-bright">Out of Action</span>
                      ) : bu.status === 'Destroyed' ? (
                        <span className="text-muted-foreground">Destroyed</span>
                      ) : (
                        <span className="text-emerald-400">{bu.status}</span>
                      )}
                      {' · '}
                      {bu.killsMadeThisBattle} kills
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-crimson-bright">
                      +{xpGained} XP
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {unit.xp} → {newXp}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60">
                      {Math.floor(bu.killsMadeThisBattle / 3)} kill XP
                      {bu.markedForGreatness ? ' +1 MFG' : ''}
                    </p>
                  </div>
                </div>

                {/* Marked for Greatness note */}
                {bu.markedForGreatness && (
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] text-yellow-400">
                    <Star className="size-3 fill-yellow-400" />
                    Marked for Greatness (+1 XP)
                  </div>
                )}

                {/* Battle Honour assignment */}
                {canHonour && (
                  <div className="mb-3 rounded border border-yellow-400/20 bg-yellow-400/5 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`honour-${bu.unitId}`}
                        checked={aar.grantHonour}
                        onChange={(e) => updateAar(bu.unitId, { grantHonour: e.target.checked })}
                        className="accent-yellow-400"
                      />
                      <label
                        htmlFor={`honour-${bu.unitId}`}
                        className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400 cursor-pointer"
                      >
                        Award Battle Honour ({unit.battleHonours.length}/{maxHonours} slots used)
                      </label>
                    </div>
                    {aar.grantHonour && (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="rounded border border-border bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-yellow-400/50 focus:outline-none"
                            placeholder="Honour name"
                            value={aar.honour.name}
                            onChange={(e) => updateHonour(bu.unitId, { name: e.target.value })}
                          />
                          <select
                            className="rounded border border-border bg-secondary px-2 py-1.5 text-xs text-foreground focus:border-yellow-400/50 focus:outline-none"
                            value={aar.honour.type}
                            onChange={(e) => updateHonour(bu.unitId, { type: e.target.value as BattleHonourType })}
                          >
                            {BATTLE_HONOUR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <textarea
                          className="w-full resize-none rounded border border-border bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-yellow-400/50 focus:outline-none"
                          placeholder="Rules text..."
                          rows={2}
                          value={aar.honour.description}
                          onChange={(e) => updateHonour(bu.unitId, { description: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Battle Scar assignment (OOA units) */}
                {bu.status === 'Out of Action' && (
                  <div className="rounded border border-crimson/20 bg-crimson/5 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`scar-${bu.unitId}`}
                        checked={aar.grantScar}
                        onChange={(e) => updateAar(bu.unitId, { grantScar: e.target.checked })}
                        className="accent-crimson"
                      />
                      <label
                        htmlFor={`scar-${bu.unitId}`}
                        className="text-[10px] font-semibold uppercase tracking-widest text-crimson-bright cursor-pointer"
                      >
                        Assign Battle Scar (unit was Out of Action)
                      </label>
                    </div>
                    {aar.grantScar && (
                      <div className="flex flex-col gap-2">
                        <input
                          className="rounded border border-border bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none"
                          placeholder="Scar name (e.g. Damaged Targeting Array)"
                          value={aar.scar.name}
                          onChange={(e) => updateScar(bu.unitId, { name: e.target.value })}
                        />
                        <textarea
                          className="w-full resize-none rounded border border-border bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none"
                          placeholder="Rules effect..."
                          rows={2}
                          value={aar.scar.effect}
                          onChange={(e) => updateScar(bu.unitId, { effect: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => onComplete(result, yourVP, opponentVP, aarData)}
      >
        <Check className="size-4" />
        Confirm & Apply to Roster
      </Button>
    </div>
  )
}

// ── Main BattlePage ───────────────────────────────────────────────────────────

export function BattlePage() {
  const { crusadeId, battleId } = useParams<{ crusadeId: string; battleId: string }>()
  const navigate = useNavigate()
  const { crusades, armies, units, battles, updateBattle, updateUnit, updateArmy, removeBattle } = useAppStore()

  const crusade = crusades.find((c) => c.id === crusadeId)
  const battle = battles.find((b) => b.id === battleId)
  const army = armies.find((a) => a.id === battle?.armyId)
  const battleUnits = battle?.units ?? []
  const battleUnitDetails = battleUnits.map((bu) => ({
    bu,
    unit: units.find((u) => u.id === bu.unitId),
  }))

  if (!battle || !crusade || !army) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Battle not found.</p>
          <Button onClick={() => navigate(`/crusades/${crusadeId}`)}>Back to Crusade</Button>
        </div>
      </AppShell>
    )
  }

  const b = battle
  const a = army
  const mfgTaken = battleUnits.some((bu) => bu.markedForGreatness)
  const [mfgAnimRect, setMfgAnimRect] = useState<DOMRect | null>(null)

  function updateBattleUnit(unitId: string, patch: Partial<typeof battleUnits[0]>) {
    updateBattle(b.id, {
      units: battleUnits.map((bu) => (bu.unitId === unitId ? { ...bu, ...patch } : bu)),
    })
  }

  function startBattle() {
    updateBattle(b.id, { phase: 'in_progress' })
  }

  function goToPostBattle() {
    updateBattle(b.id, { phase: 'post_battle' })
  }

  function completeBattle(
    result: BattleResult,
    yourVP: number,
    opponentVP: number,
    aarData: Record<string, AarUnit>,
  ) {
    battleUnits.forEach((bu) => {
      const unit = units.find((u) => u.id === bu.unitId)
      if (!unit) return
      const aar = aarData[bu.unitId]
      const xpGained = calcBattleXp(bu)
      const newXp = unit.xp + xpGained
      const newRank = getRankFromXp(newXp)

      const newHonours = [...unit.battleHonours]
      if (aar.grantHonour && aar.honour.name.trim()) {
        newHonours.push({
          id: `hon-${Date.now()}-${bu.unitId}`,
          name: aar.honour.name.trim(),
          type: aar.honour.type,
          description: aar.honour.description.trim(),
        })
      }

      const newScars = [...unit.battleScars]
      if (aar.grantScar && aar.scar.name.trim()) {
        newScars.push({
          id: `scar-${Date.now()}-${bu.unitId}`,
          name: aar.scar.name.trim(),
          effect: aar.scar.effect.trim(),
        })
      }

      updateUnit(unit.id, {
        xp: newXp,
        rank: newRank,
        crusadePoints: newHonours.length,
        battleHonours: newHonours,
        battleScars: newScars,
        outOfAction: bu.status === 'Out of Action',
        battleTally: {
          battlesParticipated: unit.battleTally.battlesParticipated + 1,
          unitsDestroyed: unit.battleTally.unitsDestroyed + bu.killsMadeThisBattle,
        },
      })
    })

    updateArmy(a.id, {
      battleTally: {
        battlesPlayed: a.battleTally.battlesPlayed + 1,
        battlesWon: a.battleTally.battlesWon + (result === 'Win' ? 1 : 0),
        battlesLost: a.battleTally.battlesLost + (result === 'Loss' ? 1 : 0),
        battlesDrawn: a.battleTally.battlesDrawn + (result === 'Draw' ? 1 : 0),
      },
    })

    updateBattle(b.id, {
      phase: 'complete',
      result,
      yourVP,
      opponentVP,
      completedAt: new Date().toISOString(),
    })
  }

  const breadcrumbs = [
    { label: 'Crusades', href: '/crusades' },
    { label: crusade.name, href: `/crusades/${crusadeId}` },
    { label: b.missionName || 'Battle' },
  ]

  // ── Phase: setup ──
  if (b.phase === 'setup') {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
              {b.missionName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {b.missionType} · {b.gamePts} pts
            </p>
          </div>

          {/* Deployed units summary */}
          <div className="panel-angled mb-6 border border-border bg-card p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Deployed Units
            </h2>
            <div className="flex flex-col gap-2">
              {battleUnitDetails.map(({ bu, unit }) =>
                unit ? (
                  <div key={bu.unitId} className="flex items-center gap-3">
                    <span className="text-lg">{unit.imageEmoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{unit.name}</p>
                      <p className="text-[10px] text-muted-foreground">{unit.datasheetName}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{unit.pointsCost} pts</span>
                  </div>
                ) : null,
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Total deployed
              </span>
              <span className="text-xs font-bold text-foreground">
                {battleUnitDetails.reduce((s, { unit }) => s + (unit?.pointsCost ?? 0), 0)} / {b.gamePts} pts
              </span>
            </div>
          </div>

          <Button className="w-full gap-2 py-3 text-sm" onClick={startBattle}>
            <Swords className="size-4" />
            Begin Battle
          </Button>
          <button
            onClick={() => {
              if (confirm('Delete this battle?')) {
                removeBattle(b.id)
                navigate(`/crusades/${crusadeId}`)
              }
            }}
            className="mt-3 w-full text-[10px] uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground"
          >
            Cancel & Delete
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Phase: in_progress ──
  if (b.phase === 'in_progress') {
    const totalKills = battleUnits.reduce((s, bu) => s + bu.killsMadeThisBattle, 0)

    return (
      <AppShell breadcrumbs={breadcrumbs}>
        {mfgAnimRect && (
          <MfgSealOverlay targetRect={mfgAnimRect} onDone={() => setMfgAnimRect(null)} />
        )}
        <div className="mb-6">
          <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
            {b.missionName}
          </h1>
          <p className="text-xs text-muted-foreground">
            {b.missionType} · {b.gamePts} pts
          </p>
        </div>

        {/* HUD */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Battle Round */}
          <div className="panel-angled flex flex-col items-center gap-2 border border-crimson/30 bg-crimson/5 p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Round</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBattle(b.id, { battleRound: Math.max(1, b.battleRound - 1) })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-xl font-black text-crimson-bright">
                {b.battleRound}
              </span>
              <button
                onClick={() => updateBattle(b.id, { battleRound: Math.min(5, b.battleRound + 1) })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          {/* Your CP */}
          <div className="panel-angled flex flex-col items-center gap-2 border border-border bg-card p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Your CP</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBattle(b.id, { commandPoints: Math.max(0, b.commandPoints - 1) })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-lg font-black text-foreground">{b.commandPoints}</span>
              <button
                onClick={() => updateBattle(b.id, { commandPoints: b.commandPoints + 1 })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          {/* Opp CP */}
          <div className="panel-angled flex flex-col items-center gap-2 border border-border bg-card p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Opp CP</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBattle(b.id, { opponentCommandPoints: Math.max(0, b.opponentCommandPoints - 1) })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-lg font-black text-foreground">{b.opponentCommandPoints}</span>
              <button
                onClick={() => updateBattle(b.id, { opponentCommandPoints: b.opponentCommandPoints + 1 })}
                className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          {/* Total kills */}
          <div className="panel-angled flex flex-col items-center gap-1 border border-border bg-card p-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Kills</span>
            <div className="flex items-center gap-1.5">
              <Swords className="size-4 text-crimson-bright" />
              <span className="text-xl font-black text-foreground">{totalKills}</span>
            </div>
          </div>
        </div>

        {/* VP trackers */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="panel-angled border border-border bg-card p-4">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Your VP</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateBattle(b.id, { yourVP: Math.max(0, b.yourVP - 1) })}
                className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex-1 text-center text-3xl font-black text-foreground">{b.yourVP}</span>
              <button
                onClick={() => updateBattle(b.id, { yourVP: b.yourVP + 1 })}
                className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="panel-angled border border-border bg-card p-4">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Opponent VP</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateBattle(b.id, { opponentVP: Math.max(0, b.opponentVP - 1) })}
                className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex-1 text-center text-3xl font-black text-foreground">{b.opponentVP}</span>
              <button
                onClick={() => updateBattle(b.id, { opponentVP: b.opponentVP + 1 })}
                className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-muted-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Unit cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {battleUnitDetails.map(({ bu, unit }) =>
            unit ? (
              <UnitBattleCard
                key={bu.unitId}
                battleUnit={bu}
                unit={unit}
                mfgTaken={mfgTaken && !bu.markedForGreatness}
                onUpdate={(patch) => updateBattleUnit(bu.unitId, patch)}
                onMfgActivated={(rect) => setMfgAnimRect(rect)}
              />
            ) : null,
          )}
        </div>

        <Button className="w-full gap-2 py-3 text-sm" onClick={goToPostBattle}>
          <Trophy className="size-4" />
          Conclude Battle — Post-Battle AAR
        </Button>
      </AppShell>
    )
  }

  // ── Phase: post_battle ──
  if (b.phase === 'post_battle') {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-black uppercase tracking-widest text-foreground">
              Post-Battle Report
            </h1>
            <p className="text-sm text-muted-foreground">{b.missionName}</p>
          </div>
          <PostBattleAAR
            battle={b}
            allUnits={units}
            onComplete={completeBattle}
          />
        </div>
      </AppShell>
    )
  }

  // ── Phase: complete ──
  const completedAt = b.completedAt
    ? new Date(b.completedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const RESULT_STYLE: Record<string, string> = {
    Win: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    Loss: 'border-crimson/50 text-crimson-bright bg-crimson/10',
    Draw: 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10',
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-2xl">
        <div className="panel-angled mb-6 border border-border bg-card p-6 text-center">
          {b.result && (
            <span className={cn('mb-3 inline-block rounded border px-4 py-1 text-sm font-black uppercase tracking-widest', RESULT_STYLE[b.result])}>
              {b.result}
            </span>
          )}
          <h1 className="mb-1 text-xl font-black uppercase tracking-widest text-foreground">
            {b.missionName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {b.missionType} · {b.gamePts} pts · {completedAt}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Your VP</span>
              <span className="text-3xl font-black text-foreground">{b.yourVP}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">vs</span>
              <span className="text-xl font-bold text-muted-foreground">⚔️</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Opp VP</span>
              <span className="text-3xl font-black text-foreground">{b.opponentVP}</span>
            </div>
          </div>
        </div>

        {/* Unit summaries */}
        <div className="mb-6 flex flex-col gap-2">
          {battleUnitDetails.map(({ bu, unit }) =>
            unit ? (
              <Link
                key={bu.unitId}
                to={`/crusades/${crusadeId}/units/${unit.id}`}
                className="panel-angled flex items-center gap-3 border border-border bg-card px-4 py-3 hover:border-muted-foreground"
              >
                <span className="text-lg">{unit.imageEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{unit.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {bu.killsMadeThisBattle} kills · {bu.status}
                  </p>
                </div>
                <div className="text-right text-[10px]">
                  <p className="font-bold text-crimson-bright">+{calcBattleXp(bu)} XP</p>
                  {bu.markedForGreatness && (
                    <p className="text-yellow-400">⭐ MFG</p>
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40" />
              </Link>
            ) : null,
          )}
        </div>

        <Link
          to={`/crusades/${crusadeId}`}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Back to {crusade.name}
        </Link>
      </div>
    </AppShell>
  )
}
