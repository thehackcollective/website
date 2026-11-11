import * as stylex from '@stylexjs/stylex'
import { m, useReducedMotion } from 'motion/react'
import { spring } from '@/lib/motion'
import { color, text } from '@/tokens/token-consts.stylex'
import { ChartSize } from '@/ui/chart-size'

const styles = stylex.create({
  wrap: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  track: { stroke: color.iconSunken },
  arc: { stroke: color.iconBrand },
  center: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    inset: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
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
  sublabel: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
})

export function RingChart({
  value,
  total,
  label,
  sublabel,
  ariaLabel,
}: {
  value: number
  total: number
  label: string
  sublabel?: string
  ariaLabel: string
}) {
  const reduce = useReducedMotion()
  const ratio = total > 0 ? Math.min(value / total, 1) : 0

  return (
    <div aria-label={ariaLabel} role="img" {...stylex.props(styles.wrap)}>
      <ChartSize>
        {({ width, height }) => {
          const size = Math.min(width, height)
          if (size <= 0) return null
          const stroke = Math.min(Math.max(size * 0.08, 6), 14)
          const r = (size - stroke) / 2 - 2
          const c = size / 2
          return (
            <svg height={size} width={size} aria-hidden>
              <circle
                {...stylex.props(styles.track)}
                cx={c}
                cy={c}
                fill="none"
                r={r}
                strokeWidth={stroke}
              />
              <m.circle
                {...stylex.props(styles.arc)}
                animate={{ pathLength: ratio }}
                cx={c}
                cy={c}
                fill="none"
                initial={reduce ? false : { pathLength: 0 }}
                r={r}
                strokeLinecap="round"
                strokeWidth={stroke}
                transform={`rotate(-90 ${c} ${c})`}
                transition={spring.slow}
              />
            </svg>
          )
        }}
      </ChartSize>
      <div {...stylex.props(styles.center)}>
        <span {...stylex.props(styles.value)}>{label}</span>
        {sublabel && <span {...stylex.props(styles.sublabel)}>{sublabel}</span>}
      </div>
    </div>
  )
}
