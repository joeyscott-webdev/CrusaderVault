import { useState } from 'react'
import { Minus, Plus, Flag, X, ChevronRight, AlertTriangle } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { UnitGameCard } from '@/components/game/UnitGameCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCrusade } from '@/lib/CrusadeContext'
import type { GameSession, GameUnit, GameUnitStatus, BattleResult, BattleRecord } from '@/types/crusade'
import { getRankFromXp } from '@/types/crusade'
import type { PageId } from '@/App'
import { cn } from '@/lib/utils'

const MISSION_TYPES = [
  'Strike Force', 'Incursion', 'Combat Patrol', 'Onslaught', 'Siege Warfare',
]

function makeSession(
  unitIds: string[],
  missionName: string,
  missionType: string,
  gamePts: number,
): GameSession {
  return {
    id: `battle-${Date.now()}`,
    missionName,
    missionType,
    gamePts,
    battleRound: 1,
    commandPoints: 12,
    opponentCommandPoints: 12,
    victoryPoints: 0,
    opponentVictoryPoints: 0,
    isComplete: false,
    units: unitIds.map((unitId) => ({
      unitId,
      status: 'Active' as GameUnitStatus,
      killsMadeThisBattle: 0,
      markedForGreatness: false,
    })),
  }
}

interface GameModePageProps {
  onNavigate: (page: PageId) => void
}

export function GameModePage({ onNavigate }: GameModePageProps) {
  const {
    units,
    force,
    gameSession,
    setGameSession,
    updateGameSession,
    updateUnit,
    setForce,
    addBattleRecord,
  } = useCrusade()

  // --- Setup state ---
  const deployable = units.filter((u) => !u.outOfAction)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(deployable.map((u) => u.id)),
  )
  const [missionName, setMissionName] = useState('New Battle')
  const [missionType, setMissionType] = useState('Strike Force')
  const [gamePts, setGamePts] = useState(1000)

  // --- Battle state ---
  const [showConcludePanel, setShowConcludePanel] = useState(false)
  const [battleResult, setBattleResult] = useState<BattleResult>('Win')
  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState('')

  const phase: 'setup' | 'battle' = gameSession && !gameSession.isComplete ? 'battle' : 'setup'

  // ── Setup helpers ────────────────────────────────────────────

  const selectedPts = deployable
    .filter((u) => selectedIds.has(u.id))
    .reduce((s, u) => s + u.pointsCost, 0)
  const overLimit = selectedPts > gamePts

  function toggleUnit(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function beginBattle() {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setGameSession(makeSession(ids, missionName, missionType, gamePts))
  }

  // ── Battle helpers ───────────────────────────────────────────

  const markedUnitId = gameSession?.units.find((gu) => gu.markedForGreatness)?.unitId

  function updateGameUnit(unitId: string, patch: Partial<GameUnit>) {
    if (!gameSession) return
    const next = gameSession.units.map((gu) =>
      gu.unitId === unitId ? { ...gu, ...patch } : gu,
    )
    updateGameSession({ units: next })
  }

  function handleToggleMark(unitId: string) {
    if (!gameSession) return
    const gu = gameSession.units.find((u) => u.unitId === unitId)
    if (!gu) return
    if (gu.markedForGreatness) {
      updateGameUnit(unitId, { markedForGreatness: false })
    } else if (!markedUnitId) {
      updateGameUnit(unitId, { markedForGreatness: true })
    }
  }

  function adjustCounter(
    field: 'battleRound' | 'commandPoints' | 'opponentCommandPoints' | 'victoryPoints' | 'opponentVictoryPoints',
    delta: number,
  ) {
    if (!gameSession) return
    const cur = gameSession[field] as number
    const min = field === 'battleRound' ? 1 : 0
    const max = field === 'battleRound' ? 5 : 99
    updateGameSession({ [field]: Math.max(min, Math.min(max, cur + delta)) })
  }

  function concludeBattle() {
    if (!gameSession) return

    const summaries: BattleRecord['unitSummaries'] = gameSession.units.map((gu) => {
      const unit = units.find((u) => u.id === gu.unitId)
      const xpGained = gu.markedForGreatness
        ? 3
        : 1 + (gu.killsMadeThisBattle > 0 ? 1 : 0)
      return {
        unitId: gu.unitId,
        unitName: unit?.name ?? gu.unitId,
        kills: gu.killsMadeThisBattle,
        status: gu.status,
        xpGained,
        markedForGreatness: gu.markedForGreatness,
      }
    })

    // Save battle record
    const record: BattleRecord = {
      id: gameSession.id,
      playedAt: new Date().toISOString(),
      missionName: gameSession.missionName,
      missionType: gameSession.missionType,
      gamePts: gameSession.gamePts,
      result: battleResult,
      yourVP: gameSession.victoryPoints,
      opponentVP: gameSession.opponentVictoryPoints,
      unitSummaries: summaries,
    }
    addBattleRecord(record)

    // Award XP + update unit tallies
    summaries.forEach(({ unitId, kills, status, xpGained }) => {
      const unit = units.find((u) => u.id === unitId)
      if (!unit) return
      const newXp = unit.xp + xpGained
      updateUnit(unitId, {
        xp: newXp,
        rank: getRankFromXp(newXp),
        crusadePoints: unit.battleHonours.length,
        outOfAction: status === 'Out of Action' ? true : unit.outOfAction,
        battleTally: {
          battlesParticipated: unit.battleTally.battlesParticipated + 1,
          unitsDestroyed: unit.battleTally.unitsDestroyed + kills,
        },
      })
    })

    // Update force record
    setForce({
      ...force,
      battleTally: {
        battlesPlayed: force.battleTally.battlesPlayed + 1,
        battlesWon: force.battleTally.battlesWon + (battleResult === 'Win' ? 1 : 0),
        battlesLost: force.battleTally.battlesLost + (battleResult === 'Loss' ? 1 : 0),
        battlesDrawn: force.battleTally.battlesDrawn + (battleResult === 'Draw' ? 1 : 0),
      },
    })

    setGameSession(null)
    onNavigate('dashboard')
  }

  function abandonBattle() {
    setGameSession(null)
  }

  // ════════════════════════════════════════════════════════════
  // SETUP PHASE
  // ════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <AppShell activePage="game" onNavigate={onNavigate}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-lg font-bold uppercase tracking-widest text-foreground">
              Battle Setup
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure your detachment for this engagement
            </p>
          </div>

          {/* Mission */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Mission Name
              </label>
              <input
                className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson focus:outline-none"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="e.g. Relic Recovery"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Battle Size
              </label>
              <select
                className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-crimson focus:outline-none"
                value={missionType}
                onChange={(e) => setMissionType(e.target.value)}
              >
                {MISSION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Points Limit */}
          <div className="mb-5">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Points Limit for this Battle
            </label>
            <div className="flex gap-2">
              {[500, 1000, 1500, 2000].map((p) => (
                <button
                  key={p}
                  onClick={() => setGamePts(p)}
                  className={cn(
                    'flex-1 rounded border py-2 text-xs font-bold uppercase tracking-widest transition-all',
                    gamePts === p
                      ? 'border-crimson bg-crimson/15 text-crimson-bright shadow-[0_0_8px_var(--crimson-glow)]'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Selection */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Select Forces to Deploy
            </p>
            {deployable.length === 0 ? (
              <p className="text-xs text-muted-foreground">No units available (all Out of Action).</p>
            ) : (
              <div className="flex flex-col gap-2">
                {deployable.map((unit) => {
                  const checked = selectedIds.has(unit.id)
                  return (
                    <button
                      key={unit.id}
                      onClick={() => toggleUnit(unit.id)}
                      className={cn(
                        'panel-angled flex items-center gap-3 border px-4 py-3 text-left transition-all',
                        checked
                          ? 'border-crimson/50 bg-crimson/10'
                          : 'border-border bg-card hover:border-muted-foreground',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold',
                          checked
                            ? 'border-crimson bg-crimson text-white'
                            : 'border-border bg-secondary',
                        )}
                      >
                        {checked && '✓'}
                      </div>
                      <span className="text-xl">{unit.imageEmoji}</span>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-semibold text-foreground">{unit.name}</span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {unit.datasheetName} · {unit.rank}
                        </span>
                      </div>
                      <span className={cn('ml-auto text-sm font-bold', checked ? 'text-foreground' : 'text-muted-foreground')}>
                        {unit.pointsCost} pts
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Points Summary */}
          <div className="mb-6 rounded border border-border bg-card px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-widest">
                Points Deployed
              </span>
              <span className={cn('font-bold', overLimit ? 'text-crimson-bright' : 'text-foreground')}>
                {selectedPts} / {gamePts} pts
              </span>
            </div>
            <Progress value={Math.min((selectedPts / gamePts) * 100, 100)} />
            {overLimit && (
              <div className="mt-2 flex items-center gap-2 text-[10px] text-crimson-bright">
                <AlertTriangle className="size-3" />
                {selectedPts - gamePts} pts over the battle limit
              </div>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              {selectedIds.size} unit{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onNavigate('dashboard')}>
              Back to Roster
            </Button>
            <Button
              className="flex-1"
              disabled={selectedIds.size === 0}
              onClick={beginBattle}
            >
              Deploy for Battle <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  // ════════════════════════════════════════════════════════════
  // BATTLE PHASE
  // ════════════════════════════════════════════════════════════
  if (!gameSession) return null

  return (
    <AppShell activePage="game" onNavigate={onNavigate}>
      {/* Top Battle HUD */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="size-4 text-crimson-bright" />
            {editingMission ? (
              <input
                autoFocus
                className="border-b border-crimson bg-transparent text-sm font-bold uppercase tracking-widest text-foreground outline-none"
                value={missionDraft}
                onChange={(e) => setMissionDraft(e.target.value)}
                onBlur={() => {
                  if (missionDraft.trim()) updateGameSession({ missionName: missionDraft.trim() })
                  setEditingMission(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (missionDraft.trim()) updateGameSession({ missionName: missionDraft.trim() })
                    setEditingMission(false)
                  }
                }}
              />
            ) : (
              <button
                onClick={() => { setMissionDraft(gameSession.missionName); setEditingMission(true) }}
                className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-glow-crimson"
              >
                {gameSession.missionName}
              </button>
            )}
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {gameSession.missionType} · {gameSession.gamePts} pts
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConcludePanel(true)}>
              Conclude Battle
            </Button>
            <button
              onClick={abandonBattle}
              title="Abandon — no changes saved"
              className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <HudCounter label="Battle Round" value={gameSession.battleRound} onDecrement={() => adjustCounter('battleRound', -1)} onIncrement={() => adjustCounter('battleRound', 1)} accent />
          <HudCounter label="Your CP" value={gameSession.commandPoints} onDecrement={() => adjustCounter('commandPoints', -1)} onIncrement={() => adjustCounter('commandPoints', 1)} />
          <HudCounter label="Opponent CP" value={gameSession.opponentCommandPoints} onDecrement={() => adjustCounter('opponentCommandPoints', -1)} onIncrement={() => adjustCounter('opponentCommandPoints', 1)} />
          <HudCounter label="Your VP" value={gameSession.victoryPoints} onDecrement={() => adjustCounter('victoryPoints', -1)} onIncrement={() => adjustCounter('victoryPoints', 1)} accent />
          <HudCounter label="Opponent VP" value={gameSession.opponentVictoryPoints} onDecrement={() => adjustCounter('opponentVictoryPoints', -1)} onIncrement={() => adjustCounter('opponentVictoryPoints', 1)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gameSession.units.map((gu) => {
          const unit = units.find((u) => u.id === gu.unitId)
          if (!unit) return null
          return (
            <UnitGameCard
              key={gu.unitId}
              unit={unit}
              gameUnit={gu}
              canMarkForGreatness={!markedUnitId}
              onStatusChange={(status) => updateGameUnit(gu.unitId, { status })}
              onKillsChange={(delta) =>
                updateGameUnit(gu.unitId, {
                  killsMadeThisBattle: Math.max(0, gu.killsMadeThisBattle + delta),
                })
              }
              onToggleMarkForGreatness={() => handleToggleMark(gu.unitId)}
            />
          )
        })}
      </div>

      {/* Conclude Battle Panel */}
      {showConcludePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
            <h2 className="mb-1 text-base font-bold uppercase tracking-widest text-foreground">
              Conclude Battle
            </h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Record the outcome. XP and kill tallies will be applied to each unit.
            </p>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Battle Result
            </p>
            <div className="mb-5 flex gap-2">
              {(['Win', 'Loss', 'Draw'] as BattleResult[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setBattleResult(r)}
                  className={cn(
                    'flex-1 rounded border py-2 text-xs font-bold uppercase tracking-widest transition-all',
                    battleResult === r
                      ? r === 'Win'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : r === 'Loss'
                          ? 'border-glow-crimson bg-crimson/10 text-crimson-bright'
                          : 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-border text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              XP Awards
            </p>
            <div className="mb-5 flex flex-col gap-1 rounded border border-border bg-secondary px-3 py-3">
              {gameSession.units.map((gu) => {
                const u = units.find((u) => u.id === gu.unitId)
                if (!u) return null
                const xp = gu.markedForGreatness ? 3 : 1 + (gu.killsMadeThisBattle > 0 ? 1 : 0)
                return (
                  <div key={gu.unitId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{u.imageEmoji}</span>
                      <span className="text-foreground">{u.name}</span>
                      {gu.markedForGreatness && <span className="text-[9px] text-yellow-400">★ MFG</span>}
                      {gu.killsMadeThisBattle > 0 && (
                        <span className="text-[9px] text-muted-foreground">{gu.killsMadeThisBattle} kills</span>
                      )}
                    </div>
                    <span className="font-bold text-yellow-400">+{xp} XP</span>
                  </div>
                )
              })}
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Final Score
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2 text-center">
              <div className="rounded border border-border bg-secondary py-2">
                <p className="text-xl font-bold text-foreground">{gameSession.victoryPoints}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your VP</p>
              </div>
              <div className="rounded border border-border bg-secondary py-2">
                <p className="text-xl font-bold text-foreground">{gameSession.opponentVictoryPoints}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Opponent VP</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConcludePanel(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={concludeBattle}>
                Confirm & Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

interface HudCounterProps {
  label: string
  value: number
  onDecrement: () => void
  onIncrement: () => void
  accent?: boolean
}

function HudCounter({ label, value, onDecrement, onIncrement, accent }: HudCounterProps) {
  return (
    <div className={cn('panel-angled flex flex-col items-center border bg-card px-3 py-3', accent ? 'border-crimson/40' : 'border-border')}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <button onClick={onDecrement} className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright">
          <Minus className="size-3" />
        </button>
        <span className={cn('text-xl font-bold', accent ? 'text-glow-crimson' : 'text-foreground')}>{value}</span>
        <button onClick={onIncrement} className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright">
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  )
}
