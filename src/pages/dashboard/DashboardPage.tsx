import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { UnitSidebarList } from '@/components/units/UnitSidebarList'
import { UnitShowcase } from '@/components/units/UnitShowcase'
import { UnitStatsPanel } from '@/components/units/UnitStatsPanel'
import { sampleUnits } from '@/data/sampleUnits'

export function DashboardPage() {
  const [selectedId, setSelectedId] = useState(sampleUnits[0].id)
  const selectedUnit = sampleUnits.find((unit) => unit.id === selectedId) ?? sampleUnits[0]

  return (
    <AppShell activeNav="Rosters">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
        <UnitSidebarList
          units={sampleUnits}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="min-h-[480px]">
          <UnitShowcase unit={selectedUnit} />
        </div>
        <UnitStatsPanel unit={selectedUnit} />
      </div>
    </AppShell>
  )
}
