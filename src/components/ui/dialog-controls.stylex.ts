import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  cursor,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'

export const dialogControls = stylex.create({
  error: {
    color: color.textDanger,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    margin: 0,
  },
  option: {
    alignItems: 'flex-start',
    cursor: cursor.pointer,
    display: 'flex',
    fontSize: text.sizeUi,
    gap: space.xs,
  },
  optionLabel: {
    color: color.textDefault,
    fontWeight: text.weightRegular,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    paddingBlock: space.xs,
    paddingInline: space.sm,
  },

  optionRow: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': {
        default: color.backgroundNeutralBold,
        [breakpoint.hover]: color.backgroundNeutralBold,
      },
    },
    borderColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.borderBold },
      ':active': { default: color.borderBolder, [breakpoint.hover]: color.borderBolder },
    },
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: '1px',
    cursor: cursor.pointer,
    display: 'flex',
    fontSize: text.sizeUi,
    gap: space.sm,
    paddingBlock: space.xs,
    paddingInline: space.sm,
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: motion.easeSmooth,
  },
  optionDetails: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: space['3xs'],
    minWidth: 0,
  },
  optionDescription: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    margin: 0,
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xs,
    justifyContent: 'space-between',
    paddingBlockEnd: space.sm,
    paddingInline: space.sm,
  },
  footerCount: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    margin: 0,
  },
})
