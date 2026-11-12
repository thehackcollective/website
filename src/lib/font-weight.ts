import { useSyncExternalStore } from 'react'
import { createListeners } from '@/lib/listeners'
import { readStored, removeStored, writeStored } from '@/lib/stored'

export const FONT_WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
] as const

export type FontWeight = (typeof FONT_WEIGHTS)[number]['value']

const DEFAULT_WEIGHT: FontWeight = '400'
const WEIGHT_ATTRIBUTE = 'data-thc-weight'

export const isFontWeight = (value: string | null): value is FontWeight =>
  FONT_WEIGHTS.some((weight) => weight.value === value)

const { subscribe, notify } = createListeners()

function current(): FontWeight {
  const cached = readStored('fontWeight')
  return isFontWeight(cached) ? cached : DEFAULT_WEIGHT
}

function show(weight: FontWeight) {
  writeStored('fontWeight', weight)
  if (weight === DEFAULT_WEIGHT) document.documentElement.removeAttribute(WEIGHT_ATTRIBUTE)
  else document.documentElement.setAttribute(WEIGHT_ATTRIBUTE, weight)
  notify()
}

export function applyFontWeight() {
  show(current())
}

let confirmed: FontWeight | null = null
let latest = 0
let session = 0
let queue: Promise<unknown> = Promise.resolve()

export function forgetFontWeight() {
  session += 1
  latest += 1
  confirmed = null
  show(DEFAULT_WEIGHT)
  removeStored('fontWeight')
}

export async function setFontWeight(
  weight: FontWeight,
  save: (fontWeight: number) => Promise<unknown>,
): Promise<boolean> {
  const fallback = confirmed ?? current()
  latest += 1
  const ticket = latest
  const owner = session
  show(weight)
  const run = queue.then(() => save(Number(weight)))
  queue = run.catch(() => undefined)
  try {
    await run
    if (owner === session) confirmed = weight
    return true
  } catch {
    if (owner === session && ticket === latest) show(confirmed ?? fallback)
    return false
  }
}

export function useFontWeight(): FontWeight {
  return useSyncExternalStore(subscribe, current, () => DEFAULT_WEIGHT)
}
