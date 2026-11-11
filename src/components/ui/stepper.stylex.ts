import * as stylex from '@stylexjs/stylex'

import { breakpoint, color, motion, radius, space } from '@/tokens/token-consts.stylex'

export const stepperStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: space.xs,
    minWidth: 0,
    textAlign: 'start',
  },
  track: {
    display: 'flex',
    gap: space.xxs,
  },
  segment: {
    backgroundColor: color.backgroundNeutralBold,
    borderRadius: radius.full,
    display: 'block',
    height: space.xxs,
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'background-color',
    transitionTimingFunction: motion.ease,
    width: space.xl,
  },
  segmentDone: {
    backgroundColor: color.backgroundInverseSolid,
  },
})
