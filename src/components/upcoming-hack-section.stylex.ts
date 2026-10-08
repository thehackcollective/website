import * as stylex from '@stylexjs/stylex'

import { color, space, text } from '@/tokens/token-consts.stylex'

export const hackStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.x3xl,
    paddingBlock: space.x5xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  headingBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    maxWidth: '42rem',
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
  body: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  item: {
    borderBottomColor: color.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    paddingBlock: space.xl,
  },
  itemFirst: {
    borderTopColor: color.hairline,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  itemBody: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
  },
  itemName: {
    color: color.ink,
    fontWeight: text.weightMedium,
  },
  itemNumber: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplaySm,
      '@media (min-width: 960px)': text.sizeDisplayMd,
    },
    fontWeight: text.weightMedium,
    letterSpacing: text.trackingDisplaySm,
    lineHeight: text.leadingDisplaySm,
  },
  actions: {
    display: 'flex',
  },
})
