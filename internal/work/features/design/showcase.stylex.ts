import * as stylex from '@stylexjs/stylex'
import { space } from '@/tokens/token-consts.stylex'

export const showcaseStyles = stylex.create({
  grid: {
    alignItems: 'center',
    display: 'grid',
    gap: space.sm,
    gridTemplateColumns: 'repeat(3, max-content)',
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  anchor: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
  },
})
