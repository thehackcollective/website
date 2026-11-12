import * as stylex from '@stylexjs/stylex'
import { card, color, layout, space } from '@/tokens/token-consts.stylex'

export const confirmationCardStyles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: color.backgroundCanvas,
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100dvh',
    padding: { default: space.md, '@media (min-width: 640px)': space.lg },
  },
  card: {
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: card.radius,
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    maxWidth: layout.confirmationCardWidth,
    padding: { default: space.md, '@media (min-width: 640px)': space.xl },
    width: '100%',
  },
})
