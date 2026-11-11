import { createClerkClient, verifyToken } from '@clerk/backend'
import type { Env } from './env'

interface Member {
  id: string
  name: string
  email: string
  imageUrl: string | null
}

export type SessionCheck = { ok: true; member: Member } | { ok: false; status: 401 | 503 }

const devMember: Member = {
  id: 'dev',
  name: 'Dev member',
  email: 'dev@localhost',
  imageUrl: null,
}

function sessionToken(request: Request): string | null {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (bearer) return bearer
  const cookie = request.headers.get('cookie') ?? ''
  return cookie.match(/(?:^|;\s*)__session=([^;]+)/)?.[1] ?? null
}

export async function checkSession(request: Request, env: Env): Promise<SessionCheck> {
  const secretKey = env.CLERK_SECRET_KEY
  if (!secretKey) {
    return import.meta.env.DEV ? { ok: true, member: devMember } : { ok: false, status: 503 }
  }
  const token = sessionToken(request)
  if (token === null) return { ok: false, status: 401 }
  const origin = new URL(request.url).origin
  const claims = await verifyToken(token, { secretKey, authorizedParties: [origin] }).catch(
    () => null,
  )
  if (claims === null || claims.sub === '') return { ok: false, status: 401 }
  const user = await createClerkClient({ secretKey }).users.getUser(claims.sub)
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  return {
    ok: true,
    member: {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || email,
      email,
      imageUrl: user.hasImage ? user.imageUrl : null,
    },
  }
}
