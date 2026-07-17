export type CrusadeRank = 'Battle-ready' | 'Blooded' | 'Battle-hardened' | 'Heroic' | 'Legendary'
export type BattleHonourType = 'Battle Trait' | 'Weapon Enhancement' | 'Crusade Relic' | 'Epic Deed' | 'Warlord Trait'
export type BattlePhase = 'setup' | 'in_progress' | 'post_battle' | 'complete'
export type BattleResult = 'Win' | 'Loss' | 'Draw'
export type MissionType = 'Combat Patrol' | 'Incursion' | 'Strike Force' | 'Onslaught'
export type BattleUnitStatus = 'Active' | 'Battle-shocked' | 'Destroyed' | 'Out of Action'

export interface BattleHonour {
  id: string
  name: string
  type: BattleHonourType
  description: string
}

export interface BattleScar {
  id: string
  name: string
  effect: string
}

export interface Crusade {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface Army {
  id: string
  crusadeId: string
  name: string
  faction: string
  supplyLimit: number
  requisitionPoints: number
  battleTally: {
    battlesPlayed: number
    battlesWon: number
    battlesLost: number
    battlesDrawn: number
  }
  createdAt: string
}

export interface Unit {
  id: string
  armyId: string
  name: string
  datasheetName: string
  pointsCost: number
  xp: number
  rank: CrusadeRank
  crusadePoints: number
  battleHonours: BattleHonour[]
  battleScars: BattleScar[]
  battleTally: {
    battlesParticipated: number
    unitsDestroyed: number
  }
  outOfAction: boolean
  imageEmoji: string
  sortOrder: number
  createdAt: string
}

export interface BattleUnit {
  unitId: string
  status: BattleUnitStatus
  killsMadeThisBattle: number
  markedForGreatness: boolean
}

export interface Battle {
  id: string
  armyId: string
  missionName: string
  missionType: MissionType
  gamePts: number
  phase: BattlePhase
  battleRound: number
  commandPoints: number
  opponentCommandPoints: number
  result: BattleResult | null
  yourVP: number
  opponentVP: number
  units: BattleUnit[]
  createdAt: string
  completedAt: string | null
}

export const RANK_XP_THRESHOLDS: Record<CrusadeRank, number> = {
  'Battle-ready': 0,
  'Blooded': 3,
  'Battle-hardened': 6,
  'Heroic': 10,
  'Legendary': 15,
}

export const RANK_MAX_HONOURS: Record<CrusadeRank, number> = {
  'Battle-ready': 0,
  'Blooded': 1,
  'Battle-hardened': 2,
  'Heroic': 3,
  'Legendary': 4,
}

export const BATTLE_HONOUR_TYPES: BattleHonourType[] = [
  'Battle Trait',
  'Weapon Enhancement',
  'Crusade Relic',
  'Epic Deed',
  'Warlord Trait',
]

export const MISSION_SIZES: Array<{ type: MissionType; pts: number }> = [
  { type: 'Combat Patrol', pts: 500 },
  { type: 'Incursion', pts: 1000 },
  { type: 'Strike Force', pts: 1500 },
  { type: 'Onslaught', pts: 2000 },
]

export function getRankFromXp(xp: number): CrusadeRank {
  if (xp >= 15) return 'Legendary'
  if (xp >= 10) return 'Heroic'
  if (xp >= 6) return 'Battle-hardened'
  if (xp >= 3) return 'Blooded'
  return 'Battle-ready'
}

export function xpForNextRank(rank: CrusadeRank): number {
  const next: Record<CrusadeRank, number> = {
    'Battle-ready': 3,
    'Blooded': 6,
    'Battle-hardened': 10,
    'Heroic': 15,
    'Legendary': 15,
  }
  return next[rank]
}

export function calcBattleXp(gu: BattleUnit): number {
  if (gu.markedForGreatness) return 3
  return 1 + (gu.killsMadeThisBattle > 0 ? 1 : 0)
}
