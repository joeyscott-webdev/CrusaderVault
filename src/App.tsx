import { useState } from 'react'
import { CrusadeProvider } from '@/lib/CrusadeContext'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { GameModePage } from '@/pages/game/GameModePage'

export type PageId = 'dashboard' | 'game'

function App() {
  const [page, setPage] = useState<PageId>('dashboard')

  return (
    <CrusadeProvider>
      {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
      {page === 'game' && <GameModePage onNavigate={setPage} />}
    </CrusadeProvider>
  )
}

export default App
