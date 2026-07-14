import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { UnitSidebarList } from '@/components/units/UnitSidebarList'
import { UnitShowcase } from '@/components/units/UnitShowcase'
import { UnitStatsPanel } from '@/components/units/UnitStatsPanel'
import { useCrusade } from '@/lib/CrusadeContext'
import type { PageId } from '@/App'

interface DashboardPageProps {
  onNavigate: (page: PageId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { units } = useCrusade()
  const [selectedId, setSelectedId] = useState(units[0]?.id ?? '')
  const selectedUnit = units.find((u) => u.id === selectedId) ?? units[0]

  if (!selectedUnit) return null

  return (
    <AppShell activePage="dashboard" onNavigate={onNavigate}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
        <UnitSidebarList
          units={units}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="min-h-[540px]">
          <UnitShowcase unit={selectedUnit} />
        </div>
        <UnitStatsPanel unit={selectedUnit} onNavigate={onNavigate} />
      </div>
    </AppShell>
  )
}
