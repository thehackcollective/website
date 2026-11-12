import * as stylex from '@stylexjs/stylex'
import { layout, space } from '@/tokens/token-consts.stylex'

export const lineFigureStyles = stylex.create({
  stage: {
    alignSelf: 'center',
    aspectRatio: '5 / 4',
    display: 'block',
    flexShrink: 0,
    height: layout.figureSm,
    maxWidth: '100%',
    position: 'relative',
    touchAction: 'pan-y',
    userSelect: 'none',
  },
  compact: {
    height: space['6xl'],
  },
  svg: {
    display: 'block',
    height: '100%',
    inset: 0,
    position: 'absolute',
    width: '100%',
  },
})
