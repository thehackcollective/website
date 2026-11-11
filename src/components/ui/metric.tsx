import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import { color, space, text } from '@/tokens/token-consts.stylex'

export type MetricDeltaTone = 'positive' | 'negative' | 'neutral'

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    minWidth: 0,
  },
  label: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    letterSpacing: text.trackingCaption,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
  },
  value: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
  },
  deltaRow: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xs,
  },
  delta: {
    fontSize: text.sizeCaption,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
  },
  deltaPositive: { color: color.textSuccess },
  deltaNegative: { color: color.textDanger },
  deltaNeutral: { color: color.textSubtle },
  context: {
    color: color.textSubtlest,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
})

const deltaToneStyles: Record<MetricDeltaTone, stylex.StyleXStyles> = {
  negative: styles.deltaNegative,
  neutral: styles.deltaNeutral,
  positive: styles.deltaPositive,
}

export type MetricProps = {
  label?: React.ReactNode

  value: React.ReactNode

  delta?: React.ReactNode
  deltaTone?: MetricDeltaTone

  context?: React.ReactNode
} & Omit<React.ComponentProps<'div'>, 'className' | 'style'>

export function Metric({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  context,
  ...props
}: MetricProps) {
  return (
    <div data-slot="metric" {...props} {...stylex.props(styles.root)}>
      {label != null && (
        <span data-slot="metric-label" {...stylex.props(styles.label)}>
          {label}
        </span>
      )}
      <span data-slot="metric-value" {...stylex.props(styles.value)}>
        {value}
      </span>
      {delta != null && (
        <span data-slot="metric-delta" {...stylex.props(styles.deltaRow)}>
          <span {...stylex.props(styles.delta, deltaToneStyles[deltaTone])}>{delta}</span>
        </span>
      )}
      {context != null && (
        <span data-slot="metric-context" {...stylex.props(styles.context)}>
          {context}
        </span>
      )}
    </div>
  )
}
