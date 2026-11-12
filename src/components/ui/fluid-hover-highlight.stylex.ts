import * as stylex from '@stylexjs/stylex'
import { color, radius } from '@/tokens/token-consts.stylex'

export const fluidHoverHighlightStyles = stylex.create({
  highlight: (width: number, height: number) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    borderRadius: radius.md,
    backgroundColor: color.backgroundSurfaceHover,
    transformOrigin: 'top left',
    pointerEvents: 'none',
  }),
  canvas: {
    backgroundColor: color.backgroundSurface,
  },
  cornerNestMdXxs: {
    borderRadius: radius.nestMdXxs,
  },
  cornerNestLgXs: {
    borderRadius: radius.nestLgXs,
  },
})
