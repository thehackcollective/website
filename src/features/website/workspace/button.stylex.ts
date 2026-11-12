import * as stylex from '@stylexjs/stylex'

import { breakpoint, color, radius, space, text } from '@/tokens/website-token-consts.stylex'

export const buttonStyles = stylex.create({
  buttonBase: {
    '::after': {
      content: '""',
      insetBlock: 'min(0px, calc((100% - 44px) / 2))',
      insetInline: 'min(0px, calc((100% - 44px) / 2))',
      position: 'absolute',
    },
    borderRadius: radius.pill,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: text.sizeBodySm,
    fontWeight: text.weightMedium,
    paddingBlock: space.xs,
    paddingInline: space.md,
    position: 'relative',
    textAlign: 'center',
    transform: {
      default: 'none',
      ':active': 'scale(0.98)',
    },
    transitionDuration: '200ms',
    transitionProperty: 'background-color, border-color, transform',
  },
  buttonLg: {
    fontSize: text.sizeBodyLg,
    paddingBlock: space.sm,
    paddingInline: space.lg,
  },
  buttonPrimary: {
    backgroundColor: {
      default: color.primary,
      ':hover': { [breakpoint.hover]: color.primaryActive },
      ':active': color.primaryActive,
    },
    color: color.onPrimary,
  },
  buttonSecondary: {
    borderColor: {
      default: color.hairlineStrong,
      ':hover': { [breakpoint.hover]: color.primary },
    },
    borderStyle: 'solid',
    borderWidth: '1px',
    color: color.ink,
  },
})
