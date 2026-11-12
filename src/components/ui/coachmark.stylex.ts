import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  layout,
  motion,
  space,
  text,
  zIndex,
} from '@/tokens/token-consts.stylex'

export const coachmarkStyles = stylex.create({
  backdrop: {
    backgroundColor: color.backgroundOverlaySubtle,
    inset: 0,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    position: 'fixed',
    transitionDuration: {
      default: motion.durationMedium,
      ':is([data-ending-style])': motion.durationExit,
      [breakpoint.reducedMotion]: '0s',
    },
    transitionProperty: 'clip-path, opacity',
    transitionTimingFunction: motion.easeInOut,
    zIndex: zIndex.dialog,
  },
  cutout: (path: string) => ({
    clipPath: path,
  }),
  positioner: {
    zIndex: zIndex.dialog,
  },
  popup: {
    color: color.textDefault,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    overflowY: 'visible',
    padding: space.md,
    transform: 'none',
    transitionProperty: 'opacity',
    width: layout.popoverWidth,
    zIndex: null,
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
  },
  title: {
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingUi,
    margin: 0,
    textWrap: 'balance',
  },
  description: {
    color: color.textSubtle,
    fontSize: text.sizeUi,
    hyphens: 'auto',
    lineHeight: text.leadingUi,
    margin: 0,
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xs,
    justifyContent: 'space-between',
  },
  count: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  actions: {
    display: 'flex',
    gap: space.xs,
  },
})
