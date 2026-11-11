import * as stylex from '@stylexjs/stylex'

import { color, space, text } from '@/tokens/website-token-consts.stylex'

export const statsStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.x2xl,
    paddingBlock: space.x4xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      '@media (min-width: 960px)': 'repeat(4, 1fr)',
    },
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    paddingBlock: space.md,
  },
  value: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: text.sizeDisplayMd,
    fontWeight: text.weightMedium,
    letterSpacing: text.trackingDisplayMd,
    lineHeight: text.leadingDisplayMd,
  },
  label: {
    color: color.meta,
    fontFamily: text.fontMono,
    fontSize: text.sizeCaption,
    fontWeight: text.weightMedium,
    letterSpacing: text.trackingEyebrow,
    lineHeight: text.leadingCaption,
    textTransform: 'uppercase',
  },
})
