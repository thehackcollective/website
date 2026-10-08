import * as stylex from '@stylexjs/stylex'

import { color, layout } from '@/tokens/token-consts.stylex'

export const pageStyles = stylex.create({
  page: {
    backgroundColor: color.canvas,
    minHeight: '100dvh',
  },
  rail: {
    backgroundColor: color.surfaceCard,
    borderLeftColor: color.hairlineStrong,
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderRightColor: color.hairlineStrong,
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    marginInline: 'auto',
    maxWidth: layout.containerWide,
    position: 'relative',
    width: '100%',
  },
  divider: {
    borderTopColor: color.hairlineStrong,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
})
