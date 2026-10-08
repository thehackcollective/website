import * as stylex from '@stylexjs/stylex'

import { color, layout, text } from '@/tokens/token-consts.stylex'

export const pageShellStyles = stylex.create({
  pageRecipe: {
    backgroundColor: color.canvas,
    minHeight: '100dvh',
  },

  railRecipe: {
    backgroundColor: color.surfaceCard,
    borderLeftColor: color.hairlineStrong,
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderRightColor: color.hairlineStrong,
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    marginInline: 'auto',
    maxWidth: layout.containerWide,
    position: 'relative',
    width: '100%',
  },

  displayTitleLg: {
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplayLg,
      '@media (min-width: 960px)': text.sizeDisplayXl,
    },
    fontWeight: text.weightMedium,
    letterSpacing: {
      default: text.trackingDisplayLg,
      '@media (min-width: 960px)': text.trackingDisplayXl,
    },
    lineHeight: {
      default: text.leadingDisplayLg,
      '@media (min-width: 960px)': text.leadingDisplayXl,
    },
  },

  displayTitleMd: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplayMd,
      '@media (min-width: 960px)': text.sizeDisplayXl,
    },
    fontWeight: text.weightMedium,
    letterSpacing: {
      default: text.trackingDisplayMd,
      '@media (min-width: 960px)': text.trackingDisplayXl,
    },
    lineHeight: {
      default: text.leadingDisplayMd,
      '@media (min-width: 960px)': text.leadingDisplayXl,
    },
    textWrap: 'balance',
  },

  displayTitleSm: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: text.sizeDisplaySm,
    fontWeight: text.weightMedium,
    letterSpacing: text.trackingDisplaySm,
    lineHeight: text.leadingDisplaySm,
  },

  eyebrow: {
    color: color.meta,
    fontFamily: text.fontMono,
    fontSize: text.sizeCaption,
    fontWeight: text.weightMedium,
    letterSpacing: text.trackingEyebrow,
    lineHeight: text.leadingCaption,
    textTransform: 'uppercase',
  },

  bodyLg: {
    color: color.body,
    fontSize: text.sizeBodyLg,
    lineHeight: text.leadingBodyLg,
  },

  bodyMd: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
  },

  bodySm: {
    color: color.meta,
    fontSize: text.sizeBodySm,
    lineHeight: text.leadingBodySm,
  },
})
