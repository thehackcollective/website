import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'

import { space } from '@/tokens/token-consts.stylex'
import type { Rung } from '@/ui/control'
import { Icon } from '@/ui/icon'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: space.stepGap,
    minWidth: 0,
  },
  trailing: { flexDirection: 'row-reverse' },
})

export function IconLabel({
  icon,
  iconLabel,
  size,
  trailing = false,
  children,
}: {
  icon: IconSvgElement
  iconLabel?: string
  size?: Rung
  trailing?: boolean
  children: ReactNode
}) {
  return (
    <span
      data-slot="icon-label"
      data-thc-step={size}
      {...stylex.props(styles.root, trailing && styles.trailing)}
    >
      <Icon icon={icon} {...(iconLabel === undefined ? {} : { label: iconLabel })} />
      <span>{children}</span>
    </span>
  )
}
