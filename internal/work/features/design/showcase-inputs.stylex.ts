import * as stylex from '@stylexjs/stylex'
import { color, space } from '@/tokens/token-consts.stylex'

export const showcaseInputStyles = stylex.create({
  icons: {
    display: 'grid',
    gap: space.sm,
    gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  icon: {
    alignItems: 'center',
    color: color.iconDefault,
    display: 'flex',
    gap: space.xs,
    minWidth: 0,
  },
})
