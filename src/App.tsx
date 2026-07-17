import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from '@/lib/StoreContext'
import { HomePage } from '@/pages/home/HomePage'
import { CrusadesPage } from '@/pages/crusades/CrusadesPage'
import { CrusadePage } from '@/pages/crusade/CrusadePage'
import { UnitPage } from '@/pages/unit/UnitPage'
import { BattlePage } from '@/pages/battle/BattlePage'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/crusades" element={<CrusadesPage />} />
        <Route path="/crusades/:crusadeId" element={<CrusadePage />} />
        <Route path="/crusades/:crusadeId/units/:unitId" element={<UnitPage />} />
        <Route path="/crusades/:crusadeId/battles/:battleId" element={<BattlePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  )
}
