import type { CrusadeForce, CrusadeUnit } from '@/types/crusade'

export const DEFAULT_FORCE: CrusadeForce = {
  name: 'Iron Sons of Macragge',
  faction: 'Adeptus Astartes — Ultramarines',
  supplyLimit: 1000,
  requisitionPoints: 3,
  battleTally: {
    battlesPlayed: 4,
    battlesWon: 3,
    battlesLost: 1,
    battlesDrawn: 0,
  },
}

export const DEFAULT_UNITS: CrusadeUnit[] = [
  {
    id: 'unit-1',
    name: 'Brother-Sergeant Aldric',
    datasheetName: 'Intercessor Squad',
    pointsCost: 95,
    xp: 14,
    rank: 'Battle-hardened',
    crusadePoints: 2,
    battleHonours: [
      {
        id: 'h1-1',
        name: 'Headhunter',
        type: 'Battle Trait',
        description:
          'At the start of your Shooting phase, select one enemy Character unit within 18" of this unit. Until the end of the phase, each time this unit makes an attack targeting that Character, improve the AP characteristic of that attack by 1.',
      },
      {
        id: 'h1-2',
        name: 'Master-crafted Bolt Rifle',
        type: 'Weapon Enhancement',
        description:
          "The sergeant's bolt rifle has been lovingly reworked by the Chapter's artificers, its mechanisms tuned to a standard beyond mere craftsmanship. Each time this unit's sergeant makes an attack with this weapon, add 1 to the hit roll.",
      },
    ],
    battleScars: [],
    battleTally: { battlesParticipated: 6, unitsDestroyed: 7 },
    outOfAction: false,
    imageEmoji: '🛡️',
    sortOrder: 0,
  },
  {
    id: 'unit-2',
    name: 'Iron Vengeance',
    datasheetName: 'Repulsor Executioner',
    pointsCost: 215,
    xp: 8,
    rank: 'Blooded',
    crusadePoints: 1,
    battleHonours: [
      {
        id: 'h2-1',
        name: 'Stalwart',
        type: 'Battle Trait',
        description:
          'This machine has weathered storms of fire that would unmake lesser vehicles. While this unit is within range of an objective marker it controls, it has the Feel No Pain 6+ ability.',
      },
    ],
    battleScars: [
      {
        id: 's2-1',
        name: 'Damaged Targeting Array',
        effect:
          "The vehicle's auspex systems have been compromised by sustained enemy fire. Subtract 1 from hit rolls made by this unit's ranged weapons while it is more than 12\" from the target.",
      },
    ],
    battleTally: { battlesParticipated: 4, unitsDestroyed: 5 },
    outOfAction: false,
    imageEmoji: '🚀',
    sortOrder: 1,
  },
  {
    id: 'unit-3',
    name: 'Claw of Talon Squad',
    datasheetName: 'Infiltrator Squad',
    pointsCost: 90,
    xp: 5,
    rank: 'Blooded',
    crusadePoints: 0,
    battleHonours: [],
    battleScars: [],
    battleTally: { battlesParticipated: 3, unitsDestroyed: 2 },
    outOfAction: false,
    imageEmoji: '🎯',
    sortOrder: 2,
  },
  {
    id: 'unit-4',
    name: 'The Wyrmslayers',
    datasheetName: 'Eradicator Squad',
    pointsCost: 130,
    xp: 6,
    rank: 'Blooded',
    crusadePoints: 1,
    battleHonours: [
      {
        id: 'h4-1',
        name: 'Trial by Combat',
        type: 'Epic Deed',
        description:
          'In a feat of arms worthy of the Chapter annals, this squad toppled a great engine of destruction against impossible odds. Once per battle, when this unit destroys a Monster or Vehicle unit, you gain 1 Command point.',
      },
    ],
    battleScars: [
      {
        id: 's4-1',
        name: 'Battle-weary',
        effect:
          'The relentless pace of the Crusade has ground these warriors down. This unit cannot use the Insane Bravery Stratagem, and must re-roll passed Battleshock tests until this scar is removed.',
      },
    ],
    battleTally: { battlesParticipated: 5, unitsDestroyed: 8 },
    outOfAction: false,
    imageEmoji: '💥',
    sortOrder: 3,
  },
]
