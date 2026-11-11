import * as stylex from '@stylexjs/stylex'

import { color, radius, space, text } from '@/tokens/website-token-consts.stylex'

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
  headingFlush: {
    marginBlock: 0,
  },
  body: {
    color: color.body,
    fontSize: text.sizeBodyLg,
    lineHeight: text.leadingBodyLg,
    marginBlock: 0,
  },
  bodyStrong: {
    color: color.primary,
    fontWeight: text.weightSemibold,
  },
  bodyLink: {
    color: color.primary,
    fontWeight: text.weightSemibold,
    textDecorationLine: {
      default: 'none',
      ':hover': 'underline',
    },
    textUnderlineOffset: '3px',
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
