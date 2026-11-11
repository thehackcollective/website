import * as stylex from '@stylexjs/stylex'
import {
  breakpoint,
  color,
  cursor,
  layout,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'

export const radioGroupStyles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
  },
  cards: {
    display: 'grid',
    gap: space.sm,
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
  },
  stacked: {
    display: 'grid',
    gap: space.sm,
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    cursor: cursor.pointer,
    display: 'flex',
    gap: space.sm,
    minHeight: `max(${layout.controlHeightMd}, ${layout.hitArea})`,
    outline: 'none',
    paddingBlock: space.xxs,
    paddingInline: space.sm,
    transitionDuration: { default: motion.durationFast, [breakpoint.reducedMotion]: '0ms' },
    transitionProperty: 'background-color, box-shadow',
  },
  rowChecked: {
    backgroundColor: {
      default: color.backgroundSunken,
      ':hover': { [breakpoint.hover]: color.backgroundSunken },
      ':active': {
        default: color.backgroundNeutral,
        [breakpoint.hover]: color.backgroundNeutral,
      },
    },
  },
  rowDisabled: {
    backgroundColor: 'transparent',
    cursor: cursor.notAllowed,
  },
  controlDisabled: {
    backgroundColor: color.backgroundSurfaceSubtle,
    borderColor: color.borderDefault,
  },
  labelDisabled: {
    color: color.textSubtlest,
  },
  control: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    borderColor: color.borderBold,
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'border-box',
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.iconSize,
    justifyContent: 'center',
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color',
    width: layout.iconSize,
  },
  controlChecked: {
    backgroundColor: color.backgroundInverseSolid,
    boxShadow: 'none',
  },
  dot: {
    backgroundColor: color.backgroundSurface,
    borderRadius: radius.full,
    display: 'block',
    height: '6px',
    width: '6px',
  },
  body: {
    alignItems: 'baseline',
    columnGap: space.sm,
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    minWidth: 0,
    rowGap: space.xxs,
  },
  bodyStacked: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  label: {
    color: color.textDefault,
    minWidth: 0,
    overflowWrap: 'anywhere',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
  },
})
