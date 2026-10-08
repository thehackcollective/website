import * as stylex from '@stylexjs/stylex'

import { color, layout, motion, space, text } from '@/tokens/token-consts.stylex'

export const joinStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.x2xl,
    paddingBlock: space.x5xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    maxWidth: layout.sidePanelMax,
  },
  heading: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: {
      default: text.sizeDisplayLg,
      '@media (min-width: 960px)': text.sizeDisplayXl,
    },
    fontWeight: text.weightSemibold,
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
  body: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  contactRow: {
    alignItems: 'center',
    borderBottomColor: color.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    display: 'flex',
    justifyContent: 'space-between',
    paddingBlock: space.lg,
  },
  contactRowFirst: {
    borderTopColor: color.hairline,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  contactLabel: {
    color: color.meta,
    fontFamily: text.fontMono,
    fontSize: text.sizeMicro,
    letterSpacing: text.trackingAllcaps,
    textTransform: 'uppercase',
  },
  contactValue: {
    color: color.ink,
    fontFamily: text.fontDisplay,
    fontSize: text.sizeBodyLg,
    fontWeight: text.weightMedium,
    transitionDuration: motion.durationFast,
    transitionProperty: 'color',
  },
  contactLink: {
    color: {
      default: color.ink,
      ':hover': color.primary,
    },
    textDecorationLine: 'underline',
    textUnderlineOffset: '3px',
    textDecorationColor: {
      default: color.hairline,
      ':hover': color.primary,
    },
  },
  footer: {
    borderTopColor: color.hairline,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    color: color.captionInk,
    fontFamily: text.fontMono,
    fontSize: text.sizeCaption,
    letterSpacing: text.trackingLabel,
    paddingBlock: space.xl,
    paddingInline: {
      default: space.lg,
      '@media (min-width: 1200px)': space.x4xl,
    },
    textTransform: 'uppercase',
  },
})
