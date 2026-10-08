import * as stylex from '@stylexjs/stylex'

import { color, layout } from '@/tokens/token-consts.stylex'

export const pageStyles = stylex.create({
  page: {
    backgroundColor: color.canvas,
    minHeight: '100dvh',
  },
  rail: {
    marginInline: 'auto',
    maxWidth: layout.containerWide,
    position: 'relative',
    width: '100%',
  },
})
