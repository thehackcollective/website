import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  cursor,
  input,
  layout,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'

export const fieldStyles = stylex.create({
  base: {
    backgroundColor: {
      ':disabled': input.defaultBackgroundDisabled,
      default: 'transparent',
    },
    borderColor: {
      ':hover': { [breakpoint.hover]: color.borderBold },
      default: input.defaultBorder,
    },

    borderRadius: radius.step,
    borderStyle: 'solid',
    borderWidth: '1px',
    color: { ':disabled': color.textSubtlest, default: input.defaultText },
    cursor: { ':disabled': cursor.notAllowed, default: cursor.text },
    fontFamily: text.fontSans,

    fontSize: `max(${text.sizeField}, ${text.sizeStep})`,
    lineHeight: text.leadingUi,
    outline: 'none',
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionTimingFunction: motion.easeSmooth,
    width: '100%',
  },

  focusRing: {
    borderColor: { ':focus-visible': input.defaultBorderFocus, default: null },
    boxShadow: { ':focus-visible': layout.focusRingField, default: null },
  },

  surfaceWithin: {
    borderColor: {
      default: input.defaultBorder,
      ':hover': { [breakpoint.hover]: color.borderBold },
      ':focus-within': input.defaultBorderFocus,
    },
    borderRadius: input.radius,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: { default: null, ':focus-within': layout.focusRingField },
    transitionDuration: motion.durationFast,
    transitionProperty: 'border-color, box-shadow',
    transitionTimingFunction: motion.easeSmooth,
  },

  embedded: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
  },

  invalid: {
    borderColor: input.defaultBorderInvalid,
  },

  readOnly: {
    backgroundColor: color.backgroundSurfaceSubtle,
    borderColor: input.defaultBorder,
    cursor: cursor.default,
  },

  placeholder: {
    '::placeholder': { color: input.defaultPlaceholder },
  },

  paddingInline: { paddingInline: space.stepPadding },
})
