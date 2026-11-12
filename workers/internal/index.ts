import { serveAsset, serveVersion } from './assets-api'
import type { Env } from './env'
import { listPeople, personById } from './people-api'
import { checkSession } from './session'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

async function handleApi(request: Request, env: Env, pathname: string): Promise<Response> {
  const session = await checkSession(request, env)
  if (!session.ok) {
    return json(
      { error: session.status === 401 ? 'signed_out' : 'auth_unavailable' },
      session.status,
    )
  }
  if (request.method !== 'GET') return json({ error: 'not_found' }, 404)
  if (pathname === '/api/me') return json(session.member)
  if (pathname === '/api/people') return json(await listPeople(env))
  const personId = pathname.match(/^\/api\/people\/([^/]+)$/)?.[1]
  if (personId === undefined) return json({ error: 'not_found' }, 404)
  const id = decodedPathPart(personId)
  if (id === null) return json({ error: 'not_found' }, 404)
  const person = await personById(env, id)
  return person === null ? json({ error: 'not_found' }, 404) : json(person)
}

function decodedPathPart(part: string): string | null {
  try {
    return decodeURIComponent(part)
  } catch {
    return null
  }
}

function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/api/')) return handleApi(request, env, pathname)
  if (pathname === '/version.json') return serveVersion(request, env)
  return serveAsset(request, env)
}

export default { fetch: route } satisfies ExportedHandler<Env>
