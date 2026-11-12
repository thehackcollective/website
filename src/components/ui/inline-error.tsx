import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { Button } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { inlineErrorStyles as styles } from '@/ui/inline-error.stylex'

export function InlineError({
  id,
  onRetry,
  children,
}: {
  id?: string
  onRetry?: () => void
  children: ReactNode
}) {
  if (!children) return null
  if (onRetry === undefined) {
    return (
      <p id={id} role="alert" {...stylex.props(styles.error)}>
        {children}
      </p>
    )
  }
  return (
    <div id={id} role="alert" data-slot="inline-error" {...stylex.props(styles.notice)}>
      <span {...stylex.props(styles.noticeIcon)}>
        <Icon icon={icons.warning} size="sm" />
      </span>
      <p {...stylex.props(styles.noticeText)}>{children}</p>
      <Button variant="secondary" size="xs" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
