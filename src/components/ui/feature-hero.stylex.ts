import * as stylex from '@stylexjs/stylex'
import { space } from '@/tokens/token-consts.stylex'

export const featureHeroStyles = stylex.create({
  hero: {
    alignItems: 'center',
    display: 'flex',
    gap: space.md,
    minWidth: 0,
  },
  heroText: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
    minWidth: 0,
  },
})
