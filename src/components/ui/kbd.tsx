import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'

import { color, layout, radius, space, text } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'

const styles = stylex.create({
  key: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'border-box',
    color: color.textSubtle,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    height: layout.kbdSize,
    justifyContent: 'center',
    lineHeight: text.leadingCaption,
    minWidth: layout.kbdSize,
    paddingInline: space['2xs'],
  },
  square: { paddingInline: 0, width: layout.kbdSize },
  glyph: { display: 'inline-flex', height: layout.kbdGlyph, width: layout.kbdGlyph },
})

export function Kbd({
  icon,
  label,
  children,
}: {
  icon?: IconSvgElement
  label?: string
  children?: ReactNode
}) {
  if (icon === undefined) return <kbd {...stylex.props(styles.key)}>{children}</kbd>
  return (
    <kbd data-slot="kbd" {...stylex.props(styles.key, styles.square)}>
      <span {...stylex.props(styles.glyph)}>
        <Icon icon={icon} size="fill" {...(label === undefined ? {} : { label })} />
      </span>
    </kbd>
  )
}
