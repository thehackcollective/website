import { ClerkProvider } from '@clerk/react'
import { authAppearance } from '@internal/work/features/auth/appearance'
import { PUBLISHABLE_KEY, SIGN_IN_PATH } from '@internal/work/features/auth/session'
import type { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  if (PUBLISHABLE_KEY === null) {
    if (import.meta.env.DEV) return children
    throw new Error(
      'CLERK_PUBLISHABLE_KEY is missing from this build. Add it to the build environment so sign-in can load.',
    )
  }
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      telemetry={false}
      appearance={authAppearance}
      signInUrl={SIGN_IN_PATH}
      signUpUrl={SIGN_IN_PATH}
      signInFallbackRedirectUrl="/"
      afterSignOutUrl={SIGN_IN_PATH}
    >
      {children}
    </ClerkProvider>
  )
}
