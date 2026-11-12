import type { Env } from './env'

interface PersonRow {
  id: string
  name: string
  headline: string | null
  avatar_url: string | null
  summary: string | null
  circle: string
  intent: number
  identity: string
  luma_attended: number | null
  luma_hosted: number | null
  subscribed_at: string | null
  whatsapp_member: number
  builder_groups: number
  chat_messages: number
  ties: string | null
}

const personFields = `p.id, p.name, p.headline, p.avatar_url, p.summary, p.circle, p.intent, p.identity,
  p.luma_attended, p.luma_hosted, p.subscribed_at, p.whatsapp_member, p.builder_groups, p.chat_messages,
  (SELECT group_concat(DISTINCT t.kind) FROM ties t WHERE t.person_id = p.id) AS ties`

const personOf = (row: PersonRow) => ({
  id: row.id,
  name: row.name,
  headline: row.headline,
  avatarUrl: row.avatar_url,
  summary: row.summary,
  circle: row.circle,
  intent: row.intent,
  identity: row.identity,
  lumaAttended: row.luma_attended,
  lumaHosted: row.luma_hosted,
  subscribedAt: row.subscribed_at,
  inWhatsapp: row.whatsapp_member === 1,
  builderGroups: row.builder_groups,
  chatMessages: row.chat_messages,
  ties: row.ties === null ? [] : row.ties.split(','),
})

export async function listPeople(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT ${personFields} FROM people p ORDER BY p.intent DESC, p.name`,
  ).all<PersonRow>()
  return results.map(personOf)
}

interface LinkRow {
  kind: string
  value: string
  source: string
}

interface TieRow {
  kind: string
  detail: string
  source: string
  source_url: string | null
  observed_at: string | null
  event_name: string | null
  event_url: string | null
}

export async function personById(env: Env, id: string) {
  const person = await env.DB.prepare(`SELECT ${personFields} FROM people p WHERE p.id = ?`)
    .bind(id)
    .first<PersonRow>()
  if (person === null) return null
  const [links, ties] = await Promise.all([
    env.DB.prepare('SELECT kind, value, source FROM person_links WHERE person_id = ? ORDER BY kind')
      .bind(id)
      .all<LinkRow>(),
    env.DB.prepare(
      `SELECT t.kind, t.detail, t.source, t.source_url, t.observed_at,
              e.name AS event_name, e.url AS event_url
       FROM ties t LEFT JOIN events e ON e.id = t.event_id
       WHERE t.person_id = ?
       ORDER BY coalesce(t.observed_at, '') DESC, t.id`,
    )
      .bind(id)
      .all<TieRow>(),
  ])
  return {
    ...personOf(person),
    links: links.results,
    evidence: ties.results.map((tie) => ({
      kind: tie.kind,
      detail: tie.detail,
      source: tie.source,
      sourceUrl: tie.source_url,
      observedAt: tie.observed_at,
      event:
        tie.event_name === null || tie.event_url === null
          ? null
          : { name: tie.event_name, url: tie.event_url },
    })),
  }
}
