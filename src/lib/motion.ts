import type { Transition } from 'motion/react'

export const spring = {
  fast: { type: 'spring', duration: 0.08, bounce: 0 },
  moderate: { type: 'spring', duration: 0.16, bounce: 0 },
  slow: { type: 'spring', duration: 0.24, bounce: 0.12 },
  glide: { type: 'spring', duration: 0.4, bounce: 0 },
} as const satisfies Record<string, Transition>

export const exitTween = {
  fast: { type: 'tween', duration: 0.06, ease: 'easeOut' },
  moderate: { type: 'tween', duration: 0.1, ease: 'easeOut' },
  slow: { type: 'tween', duration: 0.16, ease: 'easeOut' },
} as const satisfies Record<string, Transition>

export const textSwapPhase = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
} as const satisfies Transition

export const skeletonTiming = {
  showAfterMs: 150,
  minVisibleMs: 380,
} as const

export function cssEasing(value: string): string {
  const name = /^var\((--[\w-]+)\)$/.exec(value)?.[1]
  if (name === undefined || typeof document === 'undefined') return value
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease-out'
}

export const stagger = (index: number, stepMs = 40) => (stepMs * index) / 1000
