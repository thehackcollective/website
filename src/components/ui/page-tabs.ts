import { createContext } from 'react'

export interface PageTab {
  id: string
  label: string
  to: string
}

export interface PageTabSet {
  label: string
  current: string
  tabs: readonly PageTab[]
  prefetch?: (to: string) => void
}

export const PageTabsContext = createContext<PageTabSet | null>(null)

export const PageTabsProvider = PageTabsContext.Provider
