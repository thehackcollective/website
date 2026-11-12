import * as stylex from '@stylexjs/stylex'

import { breakpoint, color, space, text } from '@/tokens/website-token-consts.stylex'

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
  headingFlush: {
    marginBlock: 0,
  },
  list: {
    borderTopColor: color.hairline,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  item: {
    borderBottomColor: color.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  row: {
    alignItems: 'start',
    columnGap: space.x2xl,
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 960px)': '13rem 1fr auto',
    },
    paddingBlock: space.xl,
    rowGap: space.md,
  },
  when: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  date: {
    color: color.ink,
    fontFamily: text.fontMono,
    fontSize: text.sizeMicro,
    letterSpacing: text.trackingAllcaps,
    marginBlock: 0,
    textTransform: 'uppercase',
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    maxWidth: '42rem',
  },
  name: {
    color: color.ink,
    fontSize: text.sizeBodyXl,
    fontWeight: text.weightMedium,
    marginBlock: 0,
    textWrap: 'balance',
  },
  namePast: {
    color: color.body,
  },
  body: {
    color: color.body,
    fontSize: text.sizeBodyMd,
    lineHeight: text.leadingBodyMd,
    marginBlock: 0,
  },
  meta: {
    color: color.meta,
    fontSize: text.sizeBodySm,
    marginBlock: 0,
  },
  link: {
    color: {
      default: color.ink,
      ':hover': { [breakpoint.hover]: color.primaryActive },
      ':active': color.primaryActive,
    },
    fontSize: text.sizeBodySm,
    fontWeight: text.weightMedium,
    justifySelf: 'start',
    paddingBlock: space.sm,
    textDecorationColor: {
      default: color.hairlineStrong,
      ':hover': { [breakpoint.hover]: color.primaryActive },
    },
    textDecorationLine: 'underline',
    textUnderlineOffset: '3px',
    transitionDuration: '150ms',
    transitionProperty: 'color, text-decoration-color',
    whiteSpace: 'nowrap',
  },
})
