import * as stylex from '@stylexjs/stylex'

import { color, layout, motion, radius, space, text } from '@/tokens/token-consts.stylex'

const pulse = stylex.keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.55 },
  '100%': { opacity: 1 },
})

export const skeletonStyles = stylex.create({
  fill: { height: '100%', width: '100%' },
  stack: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
  },
  stackStretch: {
    flex: '1',
    minHeight: 0,
    minWidth: 0,
  },
  layer: {
    gridArea: '1 / 1',
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
  },
  stretch: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
  },
})

export const boneStyles = stylex.create({
  pulse: {
    animationDuration: motion.durationLoop,
    animationIterationCount: 'infinite',
    animationName: {
      '@media (prefers-reduced-motion: reduce)': 'none',
      default: pulse,
    },
    animationTimingFunction: 'ease-in-out',
    backgroundColor: color.backgroundSurfaceHover,
  },
  lineUi: { alignItems: 'center', display: 'flex', height: text.leadingUi, width: '100%' },
  lineCaption: {
    alignItems: 'center',
    display: 'flex',
    height: text.leadingCaption,
    width: '100%',
  },
  lineHeading: {
    alignItems: 'center',
    display: 'flex',
    height: text.leadingHeading,
    width: '100%',
  },
  glyphUi: { height: space.sm, width: '100%' },
  glyphCaption: { height: space.sm, width: '100%' },
  glyphHeading: { height: space.lg, width: '100%' },
  line: {
    borderRadius: radius.none,
    height: layout.skeletonLine,
  },

  avatar: {
    borderRadius: radius.full,
    height: layout.skeletonAvatar,
    width: layout.skeletonAvatar,
  },
  rect: {
    borderRadius: radius.none,
    height: layout.skeletonBlock,
    width: '100%',
  },
})
