import * as stylex from '@stylexjs/stylex'
import { color, motion, radius, space } from '@/tokens/token-consts.stylex'

const sweep = stylex.keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(250%)' },
})

const reveal = stylex.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

export const asyncContentStyles = stylex.create({
  settled: {
    alignItems: 'center',
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: space.sm,
    justifyContent: 'center',
    textAlign: 'center',
  },
  partial: {
    paddingBlockEnd: space.sm,
  },
  refreshing: {
    animationDelay: '150ms',
    animationDuration: motion.durationMedium,
    animationFillMode: 'both',
    animationName: reveal,
    animationTimingFunction: motion.ease,
    backgroundColor: color.backgroundNeutral,
    borderRadius: radius.full,
    height: space['2xs'],
    insetInline: 0,
    insetBlockStart: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 1,
    '::after': {
      animationDuration: motion.durationLoop,
      animationIterationCount: 'infinite',
      animationName: {
        '@media (prefers-reduced-motion: reduce)': 'none',
        default: sweep,
      },
      animationTimingFunction: motion.easeInOut,
      backgroundColor: color.iconSubtle,
      borderRadius: radius.full,
      content: '""',
      display: 'block',
      height: '100%',
      width: '40%',
    },
  },
})
