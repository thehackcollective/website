import type { Env } from './env'

export function serveAsset(request: Request, env: Env): Promise<Response> {
  return env.ASSETS.fetch(request)
}

export async function serveVersion(request: Request, env: Env): Promise<Response> {
  const asset = await env.ASSETS.fetch(request)
  const headers = new Headers(asset.headers)
  headers.set('cache-control', 'no-store')
  return new Response(asset.body, { status: asset.status, headers })
}
