import { frameStyles as styles } from '@internal/work/shell/frame.stylex'
import * as stylex from '@stylexjs/stylex'
import { Button } from '@/ui/button'
import { EmptyState } from '@/ui/empty-state'
import { Skeleton } from '@/ui/skeleton'

export function SessionPending() {
  return (
    <div data-thc-surface="console" {...stylex.props(styles.screen)}>
      <Skeleton aria-busy="true" aria-label="Loading" styles={styles.cardSkeleton} />
    </div>
  )
}

export function LoadFailed() {
  return (
    <main data-thc-surface="console" {...stylex.props(styles.screen)}>
      <section {...stylex.props(styles.notice)}>
        <h1 {...stylex.props(styles.title)}>This page did not load</h1>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </section>
    </main>
  )
}

export function NotFound() {
  return (
    <EmptyState
      tone="error"
      size="page"
      title="This page does not exist"
      homeAction={{ label: 'Go to Home', to: '/' }}
    />
  )
}
