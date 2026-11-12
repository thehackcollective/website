import { SignIn } from '@clerk/react'
import { signInStyles as styles } from '@internal/work/features/auth/page.stylex'
import { AuthPending } from '@internal/work/features/auth/pending'
import {
  DEV_WITHOUT_AUTH_KEY,
  signInTarget,
  useSession,
} from '@internal/work/features/auth/session'
import * as stylex from '@stylexjs/stylex'
import { Navigate, useSearchParams } from 'react-router'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'

function SignInFailed() {
  return (
    <main data-thc-scale="onboarding" {...stylex.props(styles.screen)}>
      <section aria-labelledby="sign-in-heading" {...stylex.props(styles.stack)}>
        <h1 id="sign-in-heading" {...stylex.props(styles.heading)}>
          Sign-in did not load
        </h1>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </section>
    </main>
  )
}

function SignInLoading() {
  return (
    <main data-thc-scale="onboarding" {...stylex.props(styles.screen)}>
      <Skeleton aria-busy="true" aria-label="Loading" styles={styles.cardSkeleton} />
    </main>
  )
}

function SignInScreen() {
  const session = useSession()
  const [params] = useSearchParams()
  const target = signInTarget(params.get('redirect_url'))
  if (session === 'checking')
    return <AuthPending loading={<SignInLoading />} failed={<SignInFailed />} />
  if (session === 'signed-in') return <Navigate to={target} replace />
  return (
    <main data-thc-scale="onboarding" {...stylex.props(styles.screen)}>
      <section aria-labelledby="sign-in-heading" {...stylex.props(styles.stack)}>
        <img src="/brand/icon.svg" alt="" width={256} height={256} {...stylex.props(styles.mark)} />
        <h1 id="sign-in-heading" tabIndex={-1} {...stylex.props(styles.heading)}>
          Sign in to The Hack Collective
        </h1>
        <div {...stylex.props(styles.card)}>
          <SignIn
            routing="hash"
            withSignUp
            forceRedirectUrl={target}
            signUpForceRedirectUrl={target}
          />
        </div>
      </section>
    </main>
  )
}

export function Page() {
  if (DEV_WITHOUT_AUTH_KEY) return <Navigate to="/" replace />
  return <SignInScreen />
}
