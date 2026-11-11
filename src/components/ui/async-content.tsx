import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { useSkeletonSwap } from '@/lib/hooks/use-skeleton-swap'
import { asyncContentStyles as styles } from '@/ui/async-content.stylex'
import { asyncState } from '@/ui/async-state'
import { type EmptyContent, type EmptySize, EmptyState } from '@/ui/empty-state'
import { InlineError } from '@/ui/inline-error'
import { SwapStack } from '@/ui/skeleton'

export interface AsyncContentProps {
  loading: boolean
  refreshing?: boolean
  error?: string | false | null
  partial?: string | false | null
  onRetry?: () => void
  empty?: false | EmptyContent
  emptyAction?: ReactNode
  skeleton?: ReactNode
  size?: EmptySize
  stretch?: boolean
  children?: ReactNode
}

type SettledProps = Omit<AsyncContentProps, 'loading' | 'skeleton' | 'stretch' | 'size'> & {
  size: EmptySize
}

function Outcome({ error, onRetry, empty, emptyAction, size, children }: SettledProps) {
  if (error) {
    return (
      <div {...stylex.props(styles.settled)}>
        <EmptyState tone="error" size={size} title={error} {...(onRetry ? { onRetry } : {})} />
      </div>
    )
  }
  if (empty) {
    return (
      <div {...stylex.props(styles.settled)}>
        <EmptyState size={size} {...empty} />
        {emptyAction}
      </div>
    )
  }
  return children
}

function Settled({ refreshing, partial, onRetry, ...body }: SettledProps) {
  return (
    <>
      {refreshing && (
        <span role="status" aria-label="Refreshing" {...stylex.props(styles.refreshing)} />
      )}
      {partial && !body.error && (
        <div {...stylex.props(styles.partial)}>
          <InlineError {...(onRetry ? { onRetry } : {})}>{partial}</InlineError>
        </div>
      )}
      <Outcome {...body} {...(onRetry ? { onRetry } : {})} />
    </>
  )
}

export function AsyncContent({
  loading,
  skeleton,
  stretch = false,
  refreshing = false,
  size = 'compact',
  ...settled
}: AsyncContentProps) {
  const swap = useSkeletonSwap(loading)
  const state = asyncState(swap, {
    error: Boolean(settled.error),
    empty: Boolean(settled.empty),
    refreshing,
    partial: Boolean(settled.partial),
  })
  return (
    <SwapStack state={swap} dataState={state} fallback={skeleton} stretch={stretch}>
      <Settled refreshing={refreshing} size={size} {...settled} />
    </SwapStack>
  )
}
