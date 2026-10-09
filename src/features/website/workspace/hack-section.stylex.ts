import * as stylex from '@stylexjs/stylex'

import { color, radius, space, text } from '@/tokens/token-consts.stylex'

export const hackStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: space.x4xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  intro: {
    alignItems: {
      default: 'stretch',
      '@media (min-width: 960px)': 'flex-start',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 960px)': 'row',
    },
    gap: {
      default: space.x2xl,
      '@media (min-width: 960px)': space.x5xl,
    },
  },
  headingBlock: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: space.md,
    maxWidth: '42rem',
  },
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
    marginBlock: 0,
    textWrap: 'balance',
  },
  body: {
    color: color.body,
    fontSize: text.sizeBodyLg,
    lineHeight: text.leadingBodyLg,
    marginBlock: 0,
  },
  actions: {
    display: 'flex',
    marginTop: space.md,
  },
  posterCol: {
    alignSelf: {
      default: 'stretch',
      '@media (min-width: 960px)': 'flex-start',
    },
    flex: {
      default: 'none',
      '@media (min-width: 960px)': '0 0 420px',
    },
    width: {
      default: '100%',
      '@media (min-width: 960px)': 420,
    },
  },
  poster: {
    aspectRatio: '816 / 810',
    borderRadius: radius.lg,
    display: 'block',
    height: 'auto',
    objectFit: 'cover',
    width: '100%',
  },
})
