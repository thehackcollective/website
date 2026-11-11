import * as stylex from '@stylexjs/stylex'
import { color, layout, space, text } from '@/tokens/token-consts.stylex'

export const frameStyles = stylex.create({
  screen: {
    alignItems: 'center',
    backgroundColor: color.backgroundCanvas,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100dvh',
    paddingBlock: space.xl,
    paddingInline: space.gutter,
  },
  notice: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    maxWidth: layout.columnFocus,
    textAlign: 'center',
  },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeHeading,
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingHeading,
    lineHeight: text.leadingHeading,
    margin: 0,
  },
  cardSkeleton: {
    height: layout.signInCardHeight,
    maxWidth: layout.signInCardWidth,
    width: '100%',
  },
})
