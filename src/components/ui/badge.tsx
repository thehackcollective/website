import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { Children } from 'react'

import { color, layout, radius, space, text } from '@/tokens/token-consts.stylex'
import { iconEdges } from '@/ui/icon-edges'
import { type StatusTone, statusToneStyles } from '@/ui/status-dot.stylex'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'positive'
  | 'warning'

const styles = stylex.create({
  base: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.step,
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: text.fontSans,
    fontSize: text.sizeStep,
    fontWeight: text.weightMedium,
    gap: space.stepGap,
    height: layout.stepHeight,
    justifyContent: 'center',
    lineHeight: text.leadingCaption,
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    paddingInline: space.stepPadding,
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },

  default: { backgroundColor: color.backgroundSunken, color: color.textDefault },
  secondary: { backgroundColor: color.backgroundSurfaceHover, color: color.textDefault },
  destructive: { backgroundColor: color.backgroundDangerSubtle, color: color.textDanger },
  outline: {
    backgroundColor: 'transparent',
    borderColor: color.borderDefault,
    color: color.textBody,
  },
  positive: {
    backgroundColor: color.backgroundSuccessSubtle,
    color: color.textSuccess,
  },
  warning: {
    backgroundColor: color.backgroundWarningSubtle,
    color: color.textWarning,
  },
  dot: {
    borderRadius: radius.full,
    display: 'inline-block',
    flexShrink: 0,
    height: layout.dotSizeSm,
    width: layout.dotSizeSm,
  },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  leading: { paddingInlineStart: space.stepInset },
  trailing: { paddingInlineEnd: space.stepInset },
})

const dotToneForVariant: Readonly<Record<BadgeVariant, StatusTone>> = {
  default: 'neutral',
  destructive: 'danger',
  outline: 'neutral',
  positive: 'positive',
  secondary: 'neutral',
  warning: 'warning',
}

const variantStyles: Record<BadgeVariant, stylex.StyleXStyles> = {
  default: styles.default,
  destructive: styles.destructive,
  outline: styles.outline,
  positive: styles.positive,
  secondary: styles.secondary,
  warning: styles.warning,
}

export type BadgeProps = Omit<React.ComponentProps<'span'>, 'className' | 'style'> & {
  variant?: BadgeVariant
  dot?: boolean
}

export function Badge({ variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const edges = iconEdges(children)
  return (
    <span
      data-slot="badge"
      data-thc-step="xs"
      data-variant={variant}
      {...props}
      {...stylex.props(
        styles.base,
        variantStyles[variant],
        edges.leading && styles.leading,
        edges.trailing && styles.trailing,
      )}
    >
      {dot && (
        <span
          aria-hidden
          {...stylex.props(styles.dot, statusToneStyles[dotToneForVariant[variant]])}
        />
      )}
      {Children.map(children, (child) =>
        typeof child === 'string' || typeof child === 'number' ? (
          <span {...stylex.props(styles.label)}>{child}</span>
        ) : (
          child
        ),
      )}
    </span>
  )
}
