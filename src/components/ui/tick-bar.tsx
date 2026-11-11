import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import { color, layout, motion, radius, space } from '@/tokens/token-consts.stylex'

export type TickBarTone = 'primary' | 'warning'

export interface TickBarProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style' | 'children'> {
  value: number
  max: number
  ticks?: number
  tone?: TickBarTone
}

const tickCount = 40

const styles = stylex.create({
  root: {
    display: 'flex',
    gap: space['2xs'],
    height: layout.plotHeight,
    width: '100%',
  },
  tick: {
    backgroundColor: color.backgroundSunken,
    borderRadius: radius['2xs'],
    flexBasis: 0,
    flexGrow: 1,
    height: '100%',
    minWidth: 0,
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: motion.easeSmooth,
  },
  primary: { backgroundColor: color.backgroundBrand },
  warning: { backgroundColor: color.backgroundWarning },
})

const toneStyles: Record<TickBarTone, stylex.StyleXStyles> = {
  primary: styles.primary,
  warning: styles.warning,
}

export function TickBar({
  value,
  max,
  ticks = tickCount,
  tone = 'primary',
  ...props
}: TickBarProps) {
  const ceiling = Math.max(0, max)
  const fraction = Math.min(1, Math.max(0, value / (max || 1)))
  const filled = fraction === 0 ? 0 : Math.max(1, Math.round(fraction * ticks))

  return (
    <div
      data-slot="tick-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={ceiling}
      aria-valuenow={Math.min(ceiling, Math.max(0, value))}
      {...props}
      {...stylex.props(styles.root)}
    >
      {Array.from({ length: ticks }, (_, tick) => tick).map((tick) => (
        <span key={tick} {...stylex.props(styles.tick, tick < filled && toneStyles[tone])} />
      ))}
    </div>
  )
}
