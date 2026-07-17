export type CrusadeRank =
  | 'Battle-ready'
  | 'Blooded'
  | 'Battle-hardened'
  | 'Heroic'
  | 'Legendary'

export type BattleHonourType =
  | 'Battle Trait'
  | 'Weapon Enhancement'
  | 'Crusade Relic'
  | 'Epic Deed'
  | 'Warlord Trait'

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

export interface BattleTally {
  battlesParticipated: number
  unitsDestroyed: number
}

export interface CrusadeUnit {
  id: string
  name: string
  datasheetName: string
  pointsCost: number
  xp: number
  rank: CrusadeRank
  crusadePoints: number
  battleHonours: BattleHonour[]
  battleScars: BattleScar[]
  battleTally: BattleTally
  outOfAction: boolean
  imageEmoji: string
  sortOrder: number
}

export interface CrusadeForce {
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
}

export type GameUnitStatus = 'Active' | 'Battle-shocked' | 'Destroyed' | 'Out of Action'

export interface GameUnit {
  unitId: string
  status: GameUnitStatus
  killsMadeThisBattle: number
  markedForGreatness: boolean
}

export type BattleResult = 'Win' | 'Loss' | 'Draw'

export interface GameSession {
  id: string
  missionName: string
  missionType: string
  gamePts: number
  battleRound: number
  commandPoints: number
  opponentCommandPoints: number
  victoryPoints: number
  opponentVictoryPoints: number
  units: GameUnit[]
  isComplete: boolean
}

export interface BattleUnitSummary {
  unitId: string
  unitName: string
  kills: number
  status: GameUnitStatus
  xpGained: number
  markedForGreatness: boolean
}

export interface BattleRecord {
  id: string
  playedAt: string
  missionName: string
  missionType: string
  gamePts: number
  result: BattleResult
  yourVP: number
  opponentVP: number
  unitSummaries: BattleUnitSummary[]
}

// XP thresholds for each rank (10th Ed Crusade)
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

export const RANK_ORDER: CrusadeRank[] = [
  'Battle-ready',
  'Blooded',
  'Battle-hardened',
  'Heroic',
  'Legendary',
]

export function getRankFromXp(xp: number): CrusadeRank {
  if (xp >= 15) return 'Legendary'
  if (xp >= 10) return 'Heroic'
  if (xp >= 6) return 'Battle-hardened'
  if (xp >= 3) return 'Blooded'
  return 'Battle-ready'
}

export function xpToNextRank(rank: CrusadeRank): number {
  const idx = RANK_ORDER.indexOf(rank)
  if (idx >= RANK_ORDER.length - 1) return RANK_XP_THRESHOLDS['Legendary']
  return RANK_XP_THRESHOLDS[RANK_ORDER[idx + 1]]
}
