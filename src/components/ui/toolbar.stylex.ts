import * as stylex from '@stylexjs/stylex'
import { container, layout, space } from '@/tokens/token-consts.stylex'

export const toolbarStyles = stylex.create({
  root: {
    alignItems: 'center',
    columnGap: space.xs,
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: layout.controlHeightMd,
    minWidth: 0,
    rowGap: space.xs,
  },
  search: {
    alignItems: 'center',
    display: 'flex',
    flexBasis: { default: '100%', [container.narrow]: '34ch' },
    flexGrow: { default: 1, [container.narrow]: 0 },
    flexShrink: 1,
    minWidth: 0,
  },
  status: {
    alignItems: 'center',
    columnGap: space.xs,
    display: { default: 'flex', ':empty': 'none' },
    flexBasis: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
    minWidth: 0,
    rowGap: space.xs,
  },
  actions: {
    alignItems: 'center',
    columnGap: space.xxs,
    display: 'flex',
    flexShrink: 0,
    marginInlineStart: 'auto',
    minWidth: 0,
  },
})
