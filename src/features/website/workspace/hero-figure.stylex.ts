import * as stylex from '@stylexjs/stylex'

import { color } from '@/tokens/token-consts.stylex'

export const heroFigureStyles = stylex.create({
  frame: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  svg: {
    display: 'block',
    height: 'auto',
    maxWidth: 420,
    overflow: 'visible',
    width: '100%',
  },
  stroke: {
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.2,
    vectorEffect: 'non-scaling-stroke',
  },
  sil: {
    stroke: color.ink,
  },
  face: {
    fill: color.surfaceCard,
  },
  lo: {
    stroke: color.hairlineStrong,
  },
  hi: {
    stroke: color.primary,
    strokeWidth: 1.8,
  },
})
