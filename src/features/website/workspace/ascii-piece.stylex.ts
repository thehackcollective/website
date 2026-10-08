import * as stylex from '@stylexjs/stylex'

import { color, text } from '@/tokens/token-consts.stylex'

export const asciiPieceStyles = stylex.create({
  frame: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  pre: {
    color: color.primary,
    display: 'block',
    fontFamily: text.fontMono,
    fontSize: {
      default: 5,
      '@media (min-width: 768px)': 7,
    },
    letterSpacing: 0,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
    userSelect: 'none',
    whiteSpace: 'pre',
  },
})
