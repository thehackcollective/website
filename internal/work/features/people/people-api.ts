import { ApiError } from '@/lib/api-error'
import { isRecord, isStringArray } from '@/lib/guards'

export const circles = ['core', 'partner', 'builder', 'member', 'subscriber'] as const

export type Circle = (typeof circles)[number]

export interface Person {
  id: string
  name: string
  headline: string | null
  avatarUrl: string | null
  summary: string | null
  circle: Circle
  intent: number
  identity: 'confirmed' | 'likely'
  lumaAttended: number | null
  lumaHosted: number | null
  subscribedAt: string | null
  inWhatsapp: boolean
  builderGroups: number
  chatMessages: number
  ties: readonly string[]
}

interface PersonLink {
  kind: string
  value: string
  source: string
}

export interface Evidence {
  id: number
  kind: string
  detail: string
  source: string
  sourceUrl: string | null
  observedAt: string | null
  event: { name: string; url: string } | null
}

export interface PersonDetail extends Person {
  links: readonly PersonLink[]
  evidence: readonly Evidence[]
}

class PeopleApiError extends ApiError {}

const textOrNull = (value: unknown) => (typeof value === 'string' ? value : null)
const countOrNull = (value: unknown) => (typeof value === 'number' ? value : null)
const text = (value: unknown) => (typeof value === 'string' ? value : '')
const count = (value: unknown) => (typeof value === 'number' ? value : 0)

const circleOf = (value: unknown): Circle =>
  circles.find((circle) => circle === value) ?? 'subscriber'

function personOf(value: unknown): Person {
  if (!isRecord(value) || typeof value.id !== 'string') {
    throw new PeopleApiError('The server sent a person without an id.')
  }
  return {
    id: value.id,
    name: text(value.name),
    headline: textOrNull(value.headline),
    avatarUrl: textOrNull(value.avatarUrl),
    summary: textOrNull(value.summary),
    circle: circleOf(value.circle),
    intent: count(value.intent),
    identity: value.identity === 'confirmed' ? 'confirmed' : 'likely',
    lumaAttended: countOrNull(value.lumaAttended),
    lumaHosted: countOrNull(value.lumaHosted),
    subscribedAt: textOrNull(value.subscribedAt),
    inWhatsapp: value.inWhatsapp === true,
    builderGroups: count(value.builderGroups),
    chatMessages: count(value.chatMessages),
    ties: isStringArray(value.ties) ? value.ties : [],
  }
}

function linkOf(value: unknown): PersonLink[] {
  if (!isRecord(value)) return []
  return [{ kind: text(value.kind), value: text(value.value), source: text(value.source) }]
}

function eventOf(value: unknown): Evidence['event'] {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.url !== 'string') {
    return null
  }
  return { name: value.name, url: value.url }
}

function evidenceOf(value: unknown): Evidence[] {
  if (!isRecord(value)) return []
  return [
    {
      id: typeof value.id === 'number' ? value.id : 0,
      kind: text(value.kind),
      detail: text(value.detail),
      source: text(value.source),
      sourceUrl: textOrNull(value.sourceUrl),
      observedAt: textOrNull(value.observedAt),
      event: eventOf(value.event),
    },
  ]
}

async function readJson(path: string, failure: string, missing: string | null): Promise<unknown> {
  const response = await fetch(path, { headers: { accept: 'application/json' } })
  if (response.status === 401) {
    throw new PeopleApiError('Your session ended. Reload the page to sign in again.', false)
  }
  if (response.status === 404 && missing !== null) throw new PeopleApiError(missing, false)
  if (!response.ok) throw new PeopleApiError(failure)
  return response.json()
}

export async function fetchPeople(): Promise<readonly Person[]> {
  const body = await readJson('/api/people', 'Could not load the people.', null)
  if (!Array.isArray(body)) throw new PeopleApiError('The server sent no list of people.')
  return body.map(personOf)
}

export async function fetchPerson(id: string): Promise<PersonDetail> {
  const body = await readJson(
    `/api/people/${encodeURIComponent(id)}`,
    'Could not load this person.',
    'This person is not in the CRM.',
  )
  if (!isRecord(body)) throw new PeopleApiError('The server sent no person.')
  return {
    ...personOf(body),
    links: Array.isArray(body.links) ? body.links.flatMap(linkOf) : [],
    evidence: Array.isArray(body.evidence) ? body.evidence.flatMap(evidenceOf) : [],
  }
}
