export interface SampleUnit {
  id: string
  name: string
  datasheetName: string
  rank: string
  xp: number
  pointsCost: number
  stats: {
    label: string
    value: number
    max: number
  }[]
  keywords: string[]
  imageEmoji: string
}

export const sampleUnits: SampleUnit[] = [
  {
    id: 'unit-1',
    name: 'Brother Aldric',
    datasheetName: 'Intercessor Sergeant',
    rank: 'Heroic',
    xp: 47,
    pointsCost: 95,
    stats: [
      { label: 'Attack', value: 447, max: 600 },
      { label: 'Defence', value: 80, max: 600 },
      { label: 'Accuracy', value: 244, max: 600 },
      { label: 'Dexterity', value: 239, max: 600 },
    ],
    keywords: ['Infantry', 'Character', 'Imperium'],
    imageEmoji: '🛡️',
  },
  {
    id: 'unit-2',
    name: 'Redeemer-09',
    datasheetName: 'Repulsor Executioner',
    rank: 'Battle-hardened',
    xp: 28,
    pointsCost: 215,
    stats: [
      { label: 'Attack', value: 380, max: 600 },
      { label: 'Defence', value: 410, max: 600 },
      { label: 'Accuracy', value: 190, max: 600 },
      { label: 'Dexterity', value: 90, max: 600 },
    ],
    keywords: ['Vehicle', 'Transport'],
    imageEmoji: '🚀',
  },
  {
    id: 'unit-3',
    name: 'Scout Pack Talon',
    datasheetName: 'Infiltrator Squad',
    rank: 'Blooded',
    xp: 12,
    pointsCost: 80,
    stats: [
      { label: 'Attack', value: 210, max: 600 },
      { label: 'Defence', value: 150, max: 600 },
      { label: 'Accuracy', value: 320, max: 600 },
      { label: 'Dexterity', value: 360, max: 600 },
    ],
    keywords: ['Infantry', 'Scout'],
    imageEmoji: '🎯',
  },
  {
    id: 'unit-4',
    name: 'The Wyrmslayer',
    datasheetName: 'Aggressor Squad',
    rank: 'Battle-ready',
    xp: 4,
    pointsCost: 130,
    stats: [
      { label: 'Attack', value: 290, max: 600 },
      { label: 'Defence', value: 300, max: 600 },
      { label: 'Accuracy', value: 140, max: 600 },
      { label: 'Dexterity', value: 60, max: 600 },
    ],
    keywords: ['Infantry', 'Heavy'],
    imageEmoji: '💥',
  },
]
