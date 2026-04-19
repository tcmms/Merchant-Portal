import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface DevToolsContextValue {
  isOpen: boolean
  toggle: () => void
}

const DevToolsContext = createContext<DevToolsContextValue>({ isOpen: false, toggle: () => {} })

export function DevToolsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DevToolsContext.Provider value={{ isOpen, toggle: () => setIsOpen(v => !v) }}>
      {children}
    </DevToolsContext.Provider>
  )
}

export const useDevTools = () => useContext(DevToolsContext)
