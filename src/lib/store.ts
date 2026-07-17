import { useState, useCallback } from 'react'
import type { Crusade, Army, Unit, Battle } from '@/types'

const KEYS = {
  crusades: 'cv2_crusades',
  armies: 'cv2_armies',
  units: 'cv2_units',
  battles: 'cv2_battles',
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

export function useStore() {
  const [crusades, setCrusadesState] = useState<Crusade[]>(() => load(KEYS.crusades, []))
  const [armies, setArmiesState] = useState<Army[]>(() => load(KEYS.armies, []))
  const [units, setUnitsState] = useState<Unit[]>(() => load(KEYS.units, []))
  const [battles, setBattlesState] = useState<Battle[]>(() => load(KEYS.battles, []))

  const addCrusade = useCallback((input: Omit<Crusade, 'id' | 'createdAt'>): string => {
    const id = `crusade-${Date.now()}`
    setCrusadesState((prev) => {
      const next = [...prev, { ...input, id, createdAt: new Date().toISOString() }]
      save(KEYS.crusades, next)
      return next
    })
    return id
  }, [])

  const updateCrusade = useCallback((id: string, patch: Partial<Crusade>) => {
    setCrusadesState((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      save(KEYS.crusades, next)
      return next
    })
  }, [])

  const removeCrusade = useCallback((id: string) => {
    setCrusadesState((prev) => {
      const next = prev.filter((c) => c.id !== id)
      save(KEYS.crusades, next)
      return next
    })
    setArmiesState((prev) => {
      const armyIds = prev.filter((a) => a.crusadeId === id).map((a) => a.id)
      const nextArmies = prev.filter((a) => a.crusadeId !== id)
      save(KEYS.armies, nextArmies)
      setUnitsState((uPrev) => {
        const next = uPrev.filter((u) => !armyIds.includes(u.armyId))
        save(KEYS.units, next)
        return next
      })
      setBattlesState((bPrev) => {
        const next = bPrev.filter((b) => !armyIds.includes(b.armyId))
        save(KEYS.battles, next)
        return next
      })
      return nextArmies
    })
  }, [])

  const addArmy = useCallback((input: Omit<Army, 'id' | 'createdAt'>): string => {
    const id = `army-${Date.now()}`
    setArmiesState((prev) => {
      const next = [...prev, { ...input, id, createdAt: new Date().toISOString() }]
      save(KEYS.armies, next)
      return next
    })
    return id
  }, [])

  const updateArmy = useCallback((id: string, patch: Partial<Army>) => {
    setArmiesState((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      save(KEYS.armies, next)
      return next
    })
  }, [])

  const removeArmy = useCallback((id: string) => {
    setArmiesState((prev) => {
      const next = prev.filter((a) => a.id !== id)
      save(KEYS.armies, next)
      return next
    })
    setUnitsState((prev) => {
      const next = prev.filter((u) => u.armyId !== id)
      save(KEYS.units, next)
      return next
    })
    setBattlesState((prev) => {
      const next = prev.filter((b) => b.armyId !== id)
      save(KEYS.battles, next)
      return next
    })
  }, [])

  const addUnit = useCallback((input: Omit<Unit, 'id' | 'createdAt' | 'sortOrder'>): string => {
    const id = `unit-${Date.now()}`
    setUnitsState((prev) => {
      const armyUnits = prev.filter((u) => u.armyId === input.armyId)
      const unit: Unit = { ...input, id, sortOrder: armyUnits.length, createdAt: new Date().toISOString() }
      const next = [...prev, unit]
      save(KEYS.units, next)
      return next
    })
    return id
  }, [])

  const updateUnit = useCallback((id: string, patch: Partial<Unit>) => {
    setUnitsState((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
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

  const addBattle = useCallback((input: Omit<Battle, 'id' | 'createdAt' | 'completedAt'>): string => {
    const id = `battle-${Date.now()}`
    setBattlesState((prev) => {
      const battle: Battle = { ...input, id, createdAt: new Date().toISOString(), completedAt: null }
      const next = [...prev, battle]
      save(KEYS.battles, next)
      return next
    })
    return id
  }, [])

  const updateBattle = useCallback((id: string, patch: Partial<Battle>) => {
    setBattlesState((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      save(KEYS.battles, next)
      return next
    })
  }, [])

  const removeBattle = useCallback((id: string) => {
    setBattlesState((prev) => {
      const next = prev.filter((b) => b.id !== id)
      save(KEYS.battles, next)
      return next
    })
  }, [])

  return {
    crusades,
    armies,
    units,
    battles,
    addCrusade,
    updateCrusade,
    removeCrusade,
    addArmy,
    updateArmy,
    removeArmy,
    addUnit,
    updateUnit,
    removeUnit,
    addBattle,
    updateBattle,
    removeBattle,
  }
}

export type Store = ReturnType<typeof useStore>
