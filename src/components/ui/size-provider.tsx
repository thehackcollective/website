import { createContext, type ReactNode, useContext } from 'react'

export type ControlSize = 'default' | 'compact'

const SizeContext = createContext<ControlSize>('default')

export function SizeProvider({ size, children }: { size: ControlSize; children: ReactNode }) {
  return <SizeContext.Provider value={size}>{children}</SizeContext.Provider>
}

export function useControlSize(): ControlSize {
  return useContext(SizeContext)
}
