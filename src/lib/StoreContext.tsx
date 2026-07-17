import { createContext, useContext } from 'react'
import { useStore, type Store } from './store'

const StoreCtx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStore()
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>
}

export function useAppStore(): Store {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useAppStore must be used within StoreProvider')
  return ctx
}
