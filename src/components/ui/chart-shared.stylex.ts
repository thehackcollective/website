import * as stylex from '@stylexjs/stylex'
import { color, cursor, layout, radius, space, text } from '@/tokens/token-consts.stylex'

export const chartStyles = stylex.create({
  container: {
    borderRadius: radius.sm,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    height: '100%',
    outline: 'none',
    position: 'relative',
    touchAction: 'none',
    width: '100%',
  },
  svg: {
    display: 'block',
    overflow: 'visible',
  },
  axisTick: {
    fill: color.iconSubtle,
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  grid: {
    stroke: color.iconTrack,
  },
  crosshair: {
    stroke: color.iconTrackBold,
  },
  crosshairDot: {
    fill: color.iconSurface,
  },
  revealRect: {
    transformBox: 'fill-box',
    transformOrigin: '0 0',
  },
  bar: {
    transformBox: 'fill-box',
    transformOrigin: 'center bottom',
  },
  directLabel: {
    cursor: cursor.default,
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
  },
  directLabelMuted: {
    fill: color.iconSubtle,
    fontWeight: text.weightRegular,
  },
  swatchLabel: {
    alignItems: 'center',
    color: color.textBody,
    display: 'flex',
    fontSize: text.sizeCaption,
    gap: space.xxs,
    lineHeight: text.leadingCaption,
  },
  swatch: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: '8px',
    width: '8px',
  },
  liveRegion: {
    borderWidth: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
})
