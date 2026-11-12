import { serveAsset, serveVersion } from './assets-api'
import type { Env } from './env'
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
  if (pathname === '/api/me' && request.method === 'GET') return json(session.member)
  return json({ error: 'not_found' }, 404)
}

function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/api/')) return handleApi(request, env, pathname)
  if (pathname === '/version.json') return serveVersion(request, env)
  return serveAsset(request, env)
}

export default { fetch: route } satisfies ExportedHandler<Env>
