import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, layout, space, text } from '@/tokens/token-consts.stylex'

export const signInStyles = stylex.create({
  screen: {
    alignItems: 'center',
    backgroundColor: color.backgroundCanvas,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100dvh',
    paddingBlock: { default: space.lg, [breakpoint.mobile]: space.xl },
    paddingInline: space.gutter,
  },
  stack: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    maxWidth: '100%',
    textAlign: 'center',
  },
  mark: {
    height: layout.emptyIconTile,
    width: layout.emptyIconTile,
  },
  heading: {
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
    margin: 0,
    outline: 'none',
    textWrap: 'balance',
  },
  card: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: {
      default: layout.signInCardMobileHeight,
      [breakpoint.mobile]: layout.signInCardHeight,
    },
    width: '100%',
  },
  cardSkeleton: {
    height: layout.signInCardHeight,
    maxWidth: layout.signInCardWidth,
    width: '100%',
  },
})
