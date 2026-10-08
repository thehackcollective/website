import * as stylex from '@stylexjs/stylex'

import { color, layout, space, text } from '@/tokens/token-consts.stylex'

export const heroStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: layout.containerWide,
    marginInline: 'auto',
    minHeight: '100dvh',
    paddingBlock: {
      default: space.x5xl,
      '@media (min-width: 960px)': space.x6xl,
    },
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    maxWidth: '42rem',
  },
  heading: {
    color: color.ink,
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
    textWrap: 'balance',
  },
  subheading: {
    color: color.body,
    fontSize: text.sizeBodyLg,
    lineHeight: text.leadingBodyLg,
    maxWidth: '42rem',
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
})
