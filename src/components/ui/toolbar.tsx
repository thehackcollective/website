import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { toolbarStyles as styles } from '@/ui/toolbar.stylex'

interface ToolbarProps {
  label: string
  search?: ReactNode
  status?: ReactNode
  actions?: ReactNode
}

export function Toolbar({ label, search, status, actions }: ToolbarProps) {
  return (
    <div role="group" aria-label={label} data-slot="toolbar" {...stylex.props(styles.root)}>
      {search !== undefined && (
        <div data-slot="toolbar-search" {...stylex.props(styles.search)}>
          {search}
        </div>
      )}
      {status !== undefined && (
        <div data-slot="toolbar-status" {...stylex.props(styles.status)}>
          {status}
        </div>
      )}
      {actions !== undefined && (
        <div data-slot="toolbar-actions" {...stylex.props(styles.actions)}>
          {actions}
        </div>
      )}
    </div>
  )
}
