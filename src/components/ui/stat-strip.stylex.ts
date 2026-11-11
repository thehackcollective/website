import * as stylex from '@stylexjs/stylex'
import { breakpoint, card, color, motion, space, text } from '@/tokens/token-consts.stylex'

const hoverInMotion =
  '@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export const statStripStyles = stylex.create({
  strip: {
    display: 'grid',
    gap: { default: space.xs, [breakpoint.tablet]: space.sm },
    gridColumn: '1 / -1',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      [breakpoint.tablet]: 'repeat(4, minmax(0, 1fr))',
    },
    margin: 0,
    paddingTop: space.sm,
  },
  stripThree: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  stat: {
    backgroundColor: card.background,
    borderColor: color.borderDefault,
    borderRadius: card.radius,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: space['2xs'],
    isolation: 'isolate',
    minWidth: 0,
    overflow: 'hidden',
    padding: { default: space.xs, [breakpoint.tablet]: space.md },
    position: 'relative',
  },
  hoverWash: {
    backgroundColor: color.backgroundNeutralHover,
    zIndex: -1,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
  },
  label: {
    alignItems: 'center',
    color: color.textSubtle,
    display: 'flex',
    gap: space.xxs,
    fontSize: text.sizeCaption,
    letterSpacing: text.trackingCaption,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
    margin: 0,
  },
  value: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
    margin: 0,
  },
  detail: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: text.leadingCaption,
    margin: 0,
  },
  detailPositive: { color: color.textSuccess },
  detailNegative: { color: color.textDanger },
  trend: {
    margin: 0,
    opacity: { default: 1, [breakpoint.hover]: 0 },
    paddingTop: space['2xs'],
    transform: {
      default: 'none',
      [hoverInMotion]: 'translateY(4px)',
    },
    transitionDuration: motion.durationFast,
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: motion.ease,
  },
  trendShown: {
    opacity: 1,
    transform: 'none',
  },
})
