import { useCallback, useState, useSyncExternalStore } from 'react'
import { skeletonTiming } from '@/lib/motion'

export type SkeletonSwapState = 'content' | 'skeleton' | 'pending'

type Phase = 'content' | 'pending' | 'skeleton' | 'holding'

interface Swap {
  loading: boolean
  phase: Phase
  shownAt: number | null
}

function nextPhase(phase: Phase, loading: boolean): Phase {
  if (loading) {
    if (phase === 'content') return 'pending'
    if (phase === 'holding') return 'skeleton'
    return phase
  }
  if (phase === 'pending') return 'content'
  if (phase === 'skeleton') return 'holding'
  return phase
}

const NO_SNAPSHOT = () => 0

export function useSkeletonSwap(isLoading: boolean): SkeletonSwapState {
  const [swap, setSwap] = useState<Swap>(() => ({
    loading: isLoading,
    phase: isLoading ? 'pending' : 'content',
    shownAt: null,
  }))

  let current = swap
  if (isLoading !== swap.loading) {
    current = { ...swap, loading: isLoading, phase: nextPhase(swap.phase, isLoading) }
    setSwap(current)
  }

  const { phase, shownAt } = current
  const arm = useCallback(() => {
    if (phase === 'pending') {
      const timer = setTimeout(
        () =>
          setSwap((prev) =>
            prev.phase === 'pending' ? { ...prev, phase: 'skeleton', shownAt: Date.now() } : prev,
          ),
        skeletonTiming.showAfterMs,
      )
      return () => clearTimeout(timer)
    }
    if (phase === 'holding') {
      const elapsed = shownAt === null ? skeletonTiming.minVisibleMs : Date.now() - shownAt
      const timer = setTimeout(
        () =>
          setSwap((prev) =>
            prev.phase === 'holding' ? { ...prev, phase: 'content', shownAt: null } : prev,
          ),
        Math.max(0, skeletonTiming.minVisibleMs - elapsed),
      )
      return () => clearTimeout(timer)
    }
    return () => undefined
  }, [phase, shownAt])
  useSyncExternalStore(arm, NO_SNAPSHOT, NO_SNAPSHOT)

  if (phase === 'holding') return 'skeleton'
  return phase
}
