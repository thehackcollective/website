import { useAuth, useClerk, useUser } from '@clerk/react'
import { forgetFontWeight } from '@/lib/font-weight'

type SessionState = 'checking' | 'signed-in' | 'signed-out'

export interface Member {
  id: string
  name: string
  email: string
  imageUrl: string | null
}

const configuredKey: unknown = import.meta.env.CLERK_PUBLISHABLE_KEY

export const PUBLISHABLE_KEY =
  typeof configuredKey === 'string' && configuredKey !== '' ? configuredKey : null

export const DEV_WITHOUT_AUTH_KEY = import.meta.env.DEV && PUBLISHABLE_KEY === null

export const SIGN_IN_PATH = '/login'

function useVerifiedSession(): SessionState {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return 'checking'
  return isSignedIn ? 'signed-in' : 'signed-out'
}

function useDevSession(): SessionState {
  return 'signed-in'
}

export const useSession = DEV_WITHOUT_AUTH_KEY ? useDevSession : useVerifiedSession

function useVerifiedMember(): Member | null {
  const { user } = useUser()
  if (!user) return null
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  return {
    id: user.id,
    name: user.fullName ?? email,
    email,
    imageUrl: user.hasImage ? user.imageUrl : null,
  }
}

const devMember: Member = {
  id: 'dev',
  name: 'Dev member',
  email: 'dev@localhost',
  imageUrl: null,
}

function useDevMember(): Member | null {
  return devMember
}

export const useMember = DEV_WITHOUT_AUTH_KEY ? useDevMember : useVerifiedMember

function useVerifiedSignOut(): () => void {
  const clerk = useClerk()
  return () => {
    forgetFontWeight()
    void clerk.signOut({ redirectUrl: SIGN_IN_PATH })
  }
}

function useDevSignOut(): () => void {
  return forgetFontWeight
}

export const useSignOut = DEV_WITHOUT_AUTH_KEY ? useDevSignOut : useVerifiedSignOut

export function signInTarget(raw: string | null): string {
  if (!raw) return '/'
  try {
    const target = new URL(raw, window.location.origin)
    if (target.origin !== window.location.origin || target.pathname.startsWith(SIGN_IN_PATH))
      return '/'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/'
  }
}
