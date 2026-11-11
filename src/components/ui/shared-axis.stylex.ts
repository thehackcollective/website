import * as stylex from '@stylexjs/stylex'

import { breakpoint, motion } from '@/tokens/token-consts.stylex'

const enterFromEnd = stylex.keyframes({
  from: { opacity: 0, transform: 'translateX(24px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
})
const enterFromStart = stylex.keyframes({
  from: { opacity: 0, transform: 'translateX(-24px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
})
const exitToStart = stylex.keyframes({
  from: { opacity: 1, transform: 'translateX(0)' },
  to: { opacity: 0, transform: 'translateX(-24px)' },
})
const exitToEnd = stylex.keyframes({
  from: { opacity: 1, transform: 'translateX(0)' },
  to: { opacity: 0, transform: 'translateX(24px)' },
})
const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } })

export const sharedAxisStyles = stylex.create({
  stage: {
    display: 'grid',
    flexGrow: 1,
    flexShrink: 1,
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
    minHeight: 0,
    overflow: 'hidden',
  },
  pane: {
    animationDuration: motion.durationMedium,
    animationFillMode: 'both',
    animationTimingFunction: motion.ease,
    display: 'flex',
    flexDirection: 'column',
    gridArea: '1 / 1',
    minHeight: 0,
    minWidth: 0,
  },
  leaving: { pointerEvents: 'none' },
  enterForward: { animationName: { default: enterFromEnd, [breakpoint.reducedMotion]: fadeIn } },
  enterBack: { animationName: { default: enterFromStart, [breakpoint.reducedMotion]: fadeIn } },
  exitForward: { animationName: { default: exitToStart, [breakpoint.reducedMotion]: fadeOut } },
  exitBack: { animationName: { default: exitToEnd, [breakpoint.reducedMotion]: fadeOut } },
})
