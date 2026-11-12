import * as stylex from '@stylexjs/stylex'
import { space } from '@/tokens/token-consts.stylex'

export const personStyles = stylex.create({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xl,
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    minWidth: 0,
  },
  heroBones: {
    flexGrow: 1,
  },
  avatarBone: {
    width: 56,
    height: 56,
  },
  chipBone: {
    width: 160,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
  },
})
