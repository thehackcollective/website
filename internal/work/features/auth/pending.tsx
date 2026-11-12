import { ClerkFailed, ClerkLoading } from '@clerk/react'
import type { ReactNode } from 'react'

export function AuthPending({ loading, failed }: { loading: ReactNode; failed: ReactNode }) {
  return (
    <>
      <ClerkLoading>{loading}</ClerkLoading>
      <ClerkFailed>{failed}</ClerkFailed>
    </>
  )
}
