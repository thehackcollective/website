import * as stylex from '@stylexjs/stylex'

import { color, space, text } from '@/tokens/token-consts.stylex'

export const partnersStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.x3xl,
    justifyContent: 'center',
    minHeight: '100dvh',
    paddingBlock: space.x4xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  heading: {
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  row: {
    alignItems: {
      default: 'flex-start',
      '@media (min-width: 960px)': 'center',
    },
    borderBottomColor: color.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 960px)': 'row',
    },
    gap: {
      default: space.xs,
      '@media (min-width: 960px)': space.lg,
    },
    justifyContent: 'space-between',
    paddingBlock: space.lg,
  },
  rowFirst: {
    borderTopColor: color.hairline,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  label: {
    color: color.meta,
    fontFamily: text.fontMono,
    fontSize: text.sizeMicro,
    letterSpacing: text.trackingAllcaps,
    textTransform: 'uppercase',
  },
  value: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: text.sizeBodyLg,
    fontWeight: text.weightMedium,
    lineHeight: text.leadingBodyLg,
    textAlign: {
      default: 'left',
      '@media (min-width: 960px)': 'right',
    },
  },
})
