import * as stylex from '@stylexjs/stylex'

export const virtualRowsStyles = stylex.create({
  list: {
    position: 'relative',
    width: '100%',
  },
  item: {
    insetInlineStart: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  height: (px: number) => ({ height: `${px}px` }),
  offset: (px: number) => ({ transform: `translateY(${px}px)` }),
})
