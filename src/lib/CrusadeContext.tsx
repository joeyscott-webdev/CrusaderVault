import { createContext, useContext, type ReactNode } from 'react'
import { useCrusadeStore } from './useCrusadeStore'

type Store = ReturnType<typeof useCrusadeStore>

const Ctx = createContext<Store | null>(null)

export function CrusadeProvider({ children }: { children: ReactNode }) {
  const store = useCrusadeStore()
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCrusade(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCrusade must be used within CrusadeProvider')
  return ctx
}
