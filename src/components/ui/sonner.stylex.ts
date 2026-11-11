import * as stylex from '@stylexjs/stylex'

import { layout, motion, text } from '@/tokens/token-consts.stylex'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

export const sonnerStyles = stylex.create({
  toast: {
    fontFamily: text.fontSans,
  },

  icon: {
    display: 'inline-flex',
    height: layout.iconSize,
    width: layout.iconSize,
  },

  spin: {
    animationDuration: motion.durationLoop,
    animationIterationCount: 'infinite',
    animationName: {
      '@media (prefers-reduced-motion: reduce)': 'none',
      default: spin,
    },
    animationTimingFunction: 'linear',
  },
})
