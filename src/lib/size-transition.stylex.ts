import * as stylex from '@stylexjs/stylex'
import { breakpoint, motion } from '@/tokens/token-consts.stylex'

export const sizeTransition = stylex.create({
  width: {
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'width',
    transitionTimingFunction: motion.easeDrawer,
  },
  rows: {
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'grid-template-rows',
    transitionTimingFunction: motion.ease,
  },
})
