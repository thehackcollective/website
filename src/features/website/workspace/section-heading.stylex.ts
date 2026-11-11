import * as stylex from '@stylexjs/stylex'

import { color, text } from '@/tokens/website-token-consts.stylex'

export const sectionHeadingStyles = stylex.create({
  heading: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplayMd,
      '@media (min-width: 960px)': text.sizeDisplayXl,
    },
    fontWeight: text.weightSemibold,
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
})
