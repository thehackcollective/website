import * as stylex from '@stylexjs/stylex'
import { color, layout, space, text } from '@/tokens/token-consts.stylex'

export const figureStyles = stylex.create({
  figure: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    margin: 0,
    minWidth: 0,
  },
  viewport: {
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  heightSm: { height: layout.figureSm },
  heightMd: { height: layout.figureMd },
  heightLg: { height: layout.figureLg },
  caption: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  visuallyHidden: {
    borderWidth: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
})
