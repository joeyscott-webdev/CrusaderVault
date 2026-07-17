import { useEffect, useState } from 'react'
import { Minus, Plus, Flag, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { UnitGameCard } from '@/components/game/UnitGameCard'
import { Button } from '@/components/ui/button'
import { useCrusade } from '@/lib/CrusadeContext'
import type { GameSession, GameUnit, GameUnitStatus, BattleResult } from '@/types/crusade'
import { getRankFromXp } from '@/types/crusade'
import type { PageId } from '@/App'
import { cn } from '@/lib/utils'

function makeSession(unitIds: string[]): GameSession {
  return {
    id: `battle-${Date.now()}`,
    missionName: 'New Battle',
    missionType: 'Strike Force',
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
  const { units, gameSession, setGameSession, updateGameSession, updateUnit, force, setForce } =
    useCrusade()

  const [showConcludePanel, setShowConcludePanel] = useState(false)
  const [battleResult, setBattleResult] = useState<BattleResult>('Win')
  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState('')

  // Start a session if there isn't one
  useEffect(() => {
    if (!gameSession) {
      const activeUnits = units.filter((u) => !u.outOfAction)
      setGameSession(makeSession(activeUnits.map((u) => u.id)))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!gameSession) return null

  const markedUnitId = gameSession.units.find((gu) => gu.markedForGreatness)?.unitId

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

  function adjustCounter(field: 'battleRound' | 'commandPoints' | 'opponentCommandPoints' | 'victoryPoints' | 'opponentVictoryPoints', delta: number) {
    if (!gameSession) return
    const cur = gameSession[field] as number
    const min = field === 'battleRound' ? 1 : 0
    const max = field === 'battleRound' ? 5 : 99
    updateGameSession({ [field]: Math.max(min, Math.min(max, cur + delta)) })
  }

  function concludeBattle() {
    if (!gameSession) return

    // Award XP and update tallies
    gameSession.units.forEach((gu) => {
      const unit = units.find((u) => u.id === gu.unitId)
      if (!unit) return

      const xpGain = gu.markedForGreatness
        ? 3
        : 1 + (gu.killsMadeThisBattle > 0 ? 1 : 0)

      const newXp = unit.xp + xpGain
      const newRank = getRankFromXp(newXp)
      const newDestroyed = unit.battleTally.unitsDestroyed + gu.killsMadeThisBattle

      updateUnit(unit.id, {
        xp: newXp,
        rank: newRank,
        crusadePoints: unit.battleHonours.length,
        outOfAction:
          gu.status === 'Out of Action' ? true : unit.outOfAction,
        battleTally: {
          battlesParticipated: unit.battleTally.battlesParticipated + 1,
          unitsDestroyed: newDestroyed,
        },
      })
    })

    // Update force battle tally
    setForce({
      ...force,
      battleTally: {
        battlesPlayed: force.battleTally.battlesPlayed + 1,
        battlesWon:
          force.battleTally.battlesWon + (battleResult === 'Win' ? 1 : 0),
        battlesLost:
          force.battleTally.battlesLost + (battleResult === 'Loss' ? 1 : 0),
        battlesDrawn:
          force.battleTally.battlesDrawn + (battleResult === 'Draw' ? 1 : 0),
      },
    })

    setGameSession(null)
    onNavigate('dashboard')
  }

  function abandonBattle() {
    setGameSession(null)
    onNavigate('dashboard')
  }

  return (
    <AppShell activePage="game" onNavigate={onNavigate}>
      {/* Top Battle HUD */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Mission Row */}
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
              {gameSession.missionType}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConcludePanel(true)}>
              Conclude Battle
            </Button>
            <button
              onClick={abandonBattle}
              className="flex size-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright"
              title="Abandon battle (no changes saved)"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Counters Row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <HudCounter
            label="Battle Round"
            value={gameSession.battleRound}
            onDecrement={() => adjustCounter('battleRound', -1)}
            onIncrement={() => adjustCounter('battleRound', 1)}
            accent
          />
          <HudCounter
            label="Your CP"
            value={gameSession.commandPoints}
            onDecrement={() => adjustCounter('commandPoints', -1)}
            onIncrement={() => adjustCounter('commandPoints', 1)}
          />
          <HudCounter
            label="Opponent CP"
            value={gameSession.opponentCommandPoints}
            onDecrement={() => adjustCounter('opponentCommandPoints', -1)}
            onIncrement={() => adjustCounter('opponentCommandPoints', 1)}
          />
          <HudCounter
            label="Your VP"
            value={gameSession.victoryPoints}
            onDecrement={() => adjustCounter('victoryPoints', -1)}
            onIncrement={() => adjustCounter('victoryPoints', 1)}
            accent
          />
          <HudCounter
            label="Opponent VP"
            value={gameSession.opponentVictoryPoints}
            onDecrement={() => adjustCounter('opponentVictoryPoints', -1)}
            onIncrement={() => adjustCounter('opponentVictoryPoints', 1)}
          />
        </div>
      </div>

      {/* Unit Cards Grid */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="panel-angled w-full max-w-md border border-border bg-card p-6">
            <h2 className="mb-1 text-lg font-bold uppercase tracking-widest text-foreground">
              Conclude Battle
            </h2>
            <p className="mb-6 text-xs text-muted-foreground">
              Record the outcome. XP and kill tallies will be applied to each unit.
            </p>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Battle Result
            </p>
            <div className="mb-6 flex gap-2">
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
              XP Awards Preview
            </p>
            <div className="mb-6 flex flex-col gap-1 rounded border border-border bg-secondary px-3 py-3">
              {gameSession.units.map((gu) => {
                const u = units.find((u) => u.id === gu.unitId)
                if (!u) return null
                const xp = gu.markedForGreatness ? 3 : 1 + (gu.killsMadeThisBattle > 0 ? 1 : 0)
                return (
                  <div key={gu.unitId} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{u.name}</span>
                    <span className="font-bold text-yellow-400">+{xp} XP</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConcludePanel(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={concludeBattle}>
                Confirm
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
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <button onClick={onDecrement} className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright">
          <Minus className="size-3" />
        </button>
        <span className={cn('text-xl font-bold', accent ? 'text-glow-crimson' : 'text-foreground')}>
          {value}
        </span>
        <button onClick={onIncrement} className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-crimson hover:text-crimson-bright">
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  )
}
