import { useState, useCallback } from 'react'
import type { CrusadeForce, CrusadeUnit, GameSession, BattleRecord } from '@/types/crusade'
import { DEFAULT_FORCE, DEFAULT_UNITS } from '@/data/crusadeData'

const KEYS = {
  force: 'cv_crusade_force',
  units: 'cv_units',
  gameSession: 'cv_game_session',
  battleHistory: 'cv_battle_history',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useCrusadeStore() {
  const [force, setForceState] = useState<CrusadeForce>(() =>
    load(KEYS.force, DEFAULT_FORCE),
  )
  const [units, setUnitsState] = useState<CrusadeUnit[]>(() =>
    load(KEYS.units, DEFAULT_UNITS),
  )
  const [gameSession, setGameSessionState] = useState<GameSession | null>(() =>
    load(KEYS.gameSession, null),
  )
  const [battleHistory, setBattleHistoryState] = useState<BattleRecord[]>(() =>
    load(KEYS.battleHistory, []),
  )

  const setForce = useCallback((updated: CrusadeForce) => {
    setForceState(updated)
    save(KEYS.force, updated)
  }, [])

  const setUnits = useCallback((updated: CrusadeUnit[]) => {
    setUnitsState(updated)
    save(KEYS.units, updated)
  }, [])

  const addUnit = useCallback((input: Omit<CrusadeUnit, 'id' | 'sortOrder'>) => {
    setUnitsState((prev) => {
      const unit: CrusadeUnit = {
        ...input,
        id: `unit-${Date.now()}`,
        sortOrder: prev.length,
      }
      const next = [...prev, unit]
      save(KEYS.units, next)
      return next
    })
  }, [])

  const removeUnit = useCallback((id: string) => {
    setUnitsState((prev) => {
      const next = prev.filter((u) => u.id !== id)
      save(KEYS.units, next)
      return next
    })
  }, [])

  const updateUnit = useCallback((id: string, patch: Partial<CrusadeUnit>) => {
    setUnitsState((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
      save(KEYS.units, next)
      return next
    })
  }, [])

  const setGameSession = useCallback((updated: GameSession | null) => {
    setGameSessionState(updated)
    save(KEYS.gameSession, updated)
  }, [])

  const updateGameSession = useCallback((patch: Partial<GameSession>) => {
    setGameSessionState((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      save(KEYS.gameSession, next)
      return next
    })
  }, [])

  const addBattleRecord = useCallback((record: BattleRecord) => {
    setBattleHistoryState((prev) => {
      const next = [record, ...prev].slice(0, 20)
      save(KEYS.battleHistory, next)
      return next
    })
  }, [])

  const supplyUsed = units
    .filter((u) => !u.outOfAction)
    .reduce((sum, u) => sum + u.pointsCost, 0)

  return {
    force,
    setForce,
    units,
    setUnits,
    addUnit,
    removeUnit,
    updateUnit,
    supplyUsed,
    gameSession,
    setGameSession,
    updateGameSession,
    battleHistory,
    addBattleRecord,
  }
}
