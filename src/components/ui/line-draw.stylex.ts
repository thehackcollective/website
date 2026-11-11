import * as stylex from '@stylexjs/stylex'

import { breakpoint, motion } from '@/tokens/token-consts.stylex'

const draw = stylex.keyframes({
  from: { strokeDashoffset: 1 },
  to: { strokeDashoffset: 0 },
})

export const lineDrawStyles = stylex.create({
  line: {
    animationDuration: motion.durationReveal,
    animationFillMode: 'backwards',
    animationName: { default: draw, [breakpoint.reducedMotion]: 'none' },
    animationTimingFunction: motion.easeSmooth,
    fill: 'none',
    strokeDasharray: 1,
    strokeDashoffset: 0,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.5,
  },
})
