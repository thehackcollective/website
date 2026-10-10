import * as stylex from '@stylexjs/stylex'

import { color, layout, space, text } from '@/tokens/token-consts.stylex'

export const heroStyles = stylex.create({
  section: {
    boxSizing: 'border-box',
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
  wrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 960px)': 'row',
    },
    gap: {
      default: space.x3xl,
      '@media (min-width: 960px)': space.x5xl,
    },
    width: '100%',
  },
  content: {
    containerName: 'hero-copy',
    containerType: 'inline-size',
    display: 'flex',
    flex: {
      default: '0 0 auto',
      '@media (min-width: 960px)': '0 1 50%',
    },
    flexDirection: 'column',
    gap: space.xl,
    maxWidth: '46rem',
    minWidth: 0,
    width: '100%',
  },
  figure: {
    display: {
      default: 'none',
      '@media (min-width: 640px)': 'flex',
    },
    flex: {
      default: '0 0 auto',
      '@media (min-width: 960px)': '1 1 0%',
    },
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: {
      default: 360,
      '@media (min-width: 960px)': 560,
      '@media (min-width: 1200px)': 680,
    },
    width: '100%',
  },
  heading: {
    color: color.ink,
    marginBlock: 0,
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplayLg,
      '@container hero-copy (min-width: 420px)': text.sizeDisplayXl,
      '@container hero-copy (min-width: 560px)': text.sizeDisplay2xl,
    },
    fontWeight: text.weightMedium,
    letterSpacing: {
      default: text.trackingDisplayLg,
      '@container hero-copy (min-width: 420px)': text.trackingDisplayXl,
      '@container hero-copy (min-width: 560px)': text.trackingDisplay2xl,
    },
    lineHeight: {
      default: text.leadingDisplayLg,
      '@container hero-copy (min-width: 420px)': text.leadingDisplayXl,
      '@container hero-copy (min-width: 560px)': text.leadingDisplay2xl,
    },
    textWrap: 'balance',
  },
  subheading: {
    color: color.body,
    marginBlock: 0,
    fontSize: {
      default: text.sizeBodyLg,
      '@container hero-copy (min-width: 560px)': text.sizeBodyXl,
    },
    lineHeight: {
      default: text.leadingBodyLg,
      '@container hero-copy (min-width: 560px)': text.leadingBodyXl,
    },
    maxWidth: '36rem',
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.md,
  },
})
