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

export const disclosureVars = stylex.defineVars({
  turn: '0deg',
})

export const disclosureStyles = stylex.create({
  chevron: {
    color: 'currentColor',
    display: 'inline-flex',
    flexShrink: 0,
    transform: `rotate(${disclosureVars.turn})`,
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'transform',
    transitionTimingFunction: motion.ease,
  },
})

export const accordionStyles = stylex.create({
  rootLine: {
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  },
  rootCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    minWidth: 0,
  },
  itemLine: {
    borderBottomColor: color.borderDefault,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  },
  itemCard: {
    backgroundColor: color.backgroundSurface,
    borderColor: { default: color.borderDefault, ':is([data-open])': color.borderBold },
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: '1px',
    minWidth: 0,
    overflow: 'hidden',
    transitionDuration: motion.durationFast,
    transitionProperty: 'border-color',
    transitionTimingFunction: motion.ease,
  },
  header: {
    display: 'flex',
    margin: 0,
  },
  trigger: {
    [disclosureVars.turn]: { default: '0deg', ':is([data-panel-open])': '180deg' },
    alignItems: 'center',
    color: {
      default: color.textBody,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
      ':is([data-panel-open])': color.textDefault,
    },
    cursor: cursor.pointer,
    display: 'flex',
    flexGrow: 1,
    fontSize: text.sizeBody,
    fontWeight: text.weightMedium,
    gap: space.md,
    justifyContent: 'space-between',
    lineHeight: text.leadingBody,
    minHeight: layout.rowHeight,
    outline: 'none',
    paddingBlock: space.lg,
    textAlign: 'start',
    transitionDuration: motion.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: motion.ease,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
  },
  triggerCard: {
    borderRadius: radius.lg,
    paddingInline: space.lg,
  },
  panel: {
    display: 'grid',
    gridTemplateRows: {
      default: '1fr',
      ':is([data-starting-style])': '0fr',
      ':is([data-ending-style])': '0fr',
    },
    overflow: 'hidden',
  },
  clip: {
    minHeight: 0,
    overflow: 'hidden',
  },
  body: {
    color: color.textBody,
    display: 'flex',
    flexDirection: 'column',
    fontSize: text.sizeBody,
    gap: space.md,
    lineHeight: text.leadingBody,
    minWidth: 0,
    paddingBlockEnd: space.lg,
    paddingInlineEnd: space.xl,
  },
  bodyCard: {
    paddingInlineStart: space.lg,
  },
})
