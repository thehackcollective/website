import * as stylex from '@stylexjs/stylex'
import {
  breakpoint,
  button,
  color,
  cursor,
  layout,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'

export const segmentedStyles = stylex.create({
  track: {
    alignItems: 'stretch',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.step,
    display: 'inline-flex',
    gap: space['2xs'],
    height: 'auto',
    padding: space['2xs'],
    width: 'fit-content',
  },
  trackDark: {
    backgroundColor: color.backgroundInverseSolid,
  },
  trackFill: {
    display: 'flex',
    width: '100%',
  },
  option: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: radius.nestStep2xs,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    color: {
      default: color.textSubtle,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
    },
    cursor: cursor.pointer,
    display: 'inline-flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeStep,
    fontWeight: text.weightMedium,
    gap: space.stepGap,
    justifyContent: 'center',
    minHeight: layout.hitArea,
    minWidth: layout.hitArea,
    outline: 'none',
    paddingInline: space.stepPadding,
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: motion.easeSmooth,
    whiteSpace: 'nowrap',
  },
  shapePill: {
    borderRadius: radius.pill,
  },
  optionSquare: {
    aspectRatio: '1',
    paddingInline: 0,
  },
  optionFill: {
    flexBasis: 0,
    flexGrow: 1,
  },
  optionDark: {
    color: {
      default: button.overlayText,
      ':hover': { [breakpoint.hover]: color.textInverse },
      ':active': { default: color.textInverse, [breakpoint.hover]: color.textInverse },
    },
  },
  selected: {
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    color: color.textDefault,
  },
  selectedDark: {
    backgroundColor: color.backgroundInverseHover,
    color: color.textInverse,
  },
})
