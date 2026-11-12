import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, space, text } from '@/tokens/token-consts.stylex'

export const breadcrumbsStyles = stylex.create({
  nav: {
    minWidth: 0,
  },
  list: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xs,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  link: {
    color: {
      default: color.textSubtle,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
    },
    fontSize: text.sizeUi,
    textDecorationLine: 'none',
  },
  current: {
    color: color.textDefault,
    fontSize: text.sizeUi,
  },
  separator: {
    alignItems: 'center',
    color: color.textSubtle,
    display: 'inline-flex',
  },
})
