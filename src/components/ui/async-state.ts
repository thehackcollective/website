import type { SkeletonSwapState } from '@/lib/hooks/use-skeleton-swap'

export type AsyncState = 'idle' | 'loading' | 'ready' | 'empty' | 'error' | 'refreshing' | 'partial'

type SettledState = Exclude<AsyncState, 'idle' | 'loading'>

interface SettledInput {
  error: boolean
  empty: boolean
  refreshing: boolean
  partial: boolean
}

function settledState({ error, empty, refreshing, partial }: SettledInput): SettledState {
  if (error) return 'error'
  if (refreshing) return 'refreshing'
  if (empty) return 'empty'
  if (partial) return 'partial'
  return 'ready'
}

export function asyncState(swap: SkeletonSwapState, settled: SettledInput): AsyncState {
  if (swap === 'pending') return 'idle'
  if (swap === 'skeleton') return 'loading'
  return settledState(settled)
}
