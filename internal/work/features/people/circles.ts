import type { Tone } from '@/ui/table-cells'
import type { Circle } from './people-api'

export const circleLabel: Record<Circle, string> = {
  core: 'Core team',
  partner: 'Partners',
  builder: 'Builders',
  member: 'Members',
  subscriber: 'Subscribers',
}

export const circleCaption: Record<Circle, string> = {
  core: 'The people who run THC with Louis.',
  partner: 'Co-hosts and partner contacts from the events THC ran.',
  builder: 'Proven builders: they win, organise or show up again and again.',
  member: 'In the THC WhatsApp and active across London builder groups.',
  subscriber: 'Subscribed to the Luma calendar.',
}

export const circleTone: Record<Circle, Tone> = {
  core: 'cat1',
  partner: 'cat2',
  builder: 'cat3',
  member: 'cat4',
  subscriber: 'neutral',
}

const tieTones: Record<string, Tone> = {
  'core team': 'cat1',
  winner: 'success',
  organiser: 'cat3',
  'co-host': 'cat2',
  'partner contact': 'cat2',
  'group admin': 'cat1',
  helper: 'cat3',
  'event submitter': 'cat3',
  'chat voice': 'cat4',
  'builder circuit': 'neutral',
  personal: 'cat5',
}

export const tieTone = (kind: string): Tone => tieTones[kind] ?? 'neutral'

const tieOrder = Object.keys(tieTones)

const tieRank = (kind: string) => {
  const rank = tieOrder.indexOf(kind)
  return rank === -1 ? tieOrder.length : rank
}

export const strongestFirst = (ties: readonly string[]) =>
  ties.toSorted((a, b) => tieRank(a) - tieRank(b))

export function intentTone(intent: number): Tone {
  if (intent >= 70) return 'success'
  if (intent >= 40) return 'warning'
  return 'neutral'
}
