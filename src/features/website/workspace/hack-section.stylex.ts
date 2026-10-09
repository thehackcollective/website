import * as stylex from '@stylexjs/stylex'

import { color, space, text } from '@/tokens/token-consts.stylex'

export const hackStyles = stylex.create({
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
    marginBlock: 0,
    textTransform: 'uppercase',
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
    alignItems: 'baseline',
    display: 'flex',
    gap: space.lg,
    justifyContent: 'space-between',
  },
  itemBody: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
    marginBlock: 0,
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
