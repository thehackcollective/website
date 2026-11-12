import * as stylex from '@stylexjs/stylex'

import { color, space, text } from '@/tokens/token-consts.stylex'

export const brandLockupStyles = stylex.create({
  root: {
    alignItems: 'center',
    color: color.textDefault,
    display: 'inline-flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontWeight: text.weightRegular,
    gap: space.xs,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
  },
  mark: {
    flexShrink: 0,
    height: '1.2em',
    width: '1.2em',
  },
})
