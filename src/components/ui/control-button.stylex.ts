import * as stylex from '@stylexjs/stylex'
import {
  breakpoint,
  color,
  cursor,
  layout,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'

export const controlButtonStyles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.full,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    cursor: { default: cursor.pointer, ':disabled': cursor.notAllowed },
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    gap: space.xxs,
    height: { default: '44px', [breakpoint.mobile]: '2rem' },
    justifyContent: 'center',
    color: { default: null, ':disabled': color.textSubtlest },
    outline: 'none',
    paddingInline: space.sm,
    transform: {
      default: null,
      ':not(:disabled):active': 'scale(0.97)',
      [breakpoint.reducedMotion]: 'none',
    },
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, color, box-shadow, transform',
    transitionTimingFunction: motion.ease,
    whiteSpace: 'nowrap',
  },
})
