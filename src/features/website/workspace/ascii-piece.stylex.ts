import * as stylex from '@stylexjs/stylex'

import { color, text } from '@/tokens/token-consts.stylex'

export const asciiPieceStyles = stylex.create({
  frame: {
    alignItems: 'center',
    backgroundColor: color.primary,
    containerType: 'inline-size',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  pre: {
    color: color.onPrimary,
    display: 'block',
    fontFamily: text.fontMono,
    fontSize: '1.6cqw',
    letterSpacing: 0,
    lineHeight: 1.2,
    margin: 0,
    userSelect: 'none',
    whiteSpace: 'pre',
  },
})
