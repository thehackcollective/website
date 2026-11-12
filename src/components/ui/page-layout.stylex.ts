import * as stylex from '@stylexjs/stylex'
import { space } from '@/tokens/token-consts.stylex'

export const pageLayoutStyles = stylex.create({
  page: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    minWidth: 0,
    paddingBlockEnd: space['3xl'],
    width: '100%',
  },
})
