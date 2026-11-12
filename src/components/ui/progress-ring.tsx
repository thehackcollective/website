import * as stylex from '@stylexjs/stylex'
import { breakpoint, layout, motion } from '@/tokens/token-consts.stylex'

const RING_R = 7
const RING_C = 2 * Math.PI * RING_R

const styles = stylex.create({
  ring: {
    display: 'inline-flex',
    flexShrink: 0,
    transform: 'rotate(-90deg)',
  },
  settle: {
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'stroke-dashoffset',
    transitionTimingFunction: motion.ease,
  },
})

export function ProgressRing({
  progress,
  settling = false,
}: {
  progress: number
  settling?: boolean
}) {
  return (
    <svg
      aria-hidden
      width={layout.iconSizeSm}
      height={layout.iconSizeSm}
      viewBox="0 0 16 16"
      {...stylex.props(styles.ring)}
    >
      <circle
        cx="8"
        cy="8"
        r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <circle
        cx="8"
        cy="8"
        r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * progress}
        {...stylex.props(settling && styles.settle)}
      />
    </svg>
  )
}
