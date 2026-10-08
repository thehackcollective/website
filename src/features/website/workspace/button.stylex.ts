import * as stylex from '@stylexjs/stylex'

import { color, radius, space, text } from '@/tokens/token-consts.stylex'

export const buttonStyles = stylex.create({
  buttonBase: {
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
      ':hover': color.primaryActive,
    },
    color: color.onPrimary,
  },
  buttonSecondary: {
    borderColor: {
      default: color.hairlineStrong,
      ':hover': color.primary,
    },
    borderStyle: 'solid',
    borderWidth: '1px',
    color: color.ink,
  },
})
