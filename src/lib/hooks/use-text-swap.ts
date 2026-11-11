import { useState } from 'react'

export type TextSwapDirection = 'up' | 'down'

export function useTextSwap(text: string): {
  current: string
  direction: TextSwapDirection
  key: number
} {
  const [entry, setEntry] = useState<{
    current: string
    direction: TextSwapDirection
    key: number
  }>({ current: text, direction: 'up', key: 0 })

  if (text !== entry.current) {
    const next = {
      current: text,
      direction: text.localeCompare(entry.current) >= 0 ? ('up' as const) : ('down' as const),
      key: entry.key + 1,
    }
    setEntry(next)
    return next
  }

  return entry
}
