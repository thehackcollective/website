import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  cursor,
  glass,
  hostContract,
  input,
  layout,
  motion,
  radius,
  shadow,
  space,
  text,
} from '@/tokens/token-consts.stylex'

const modalTop = 'min(12dvh, 7rem)'
const glassBlur = `${glass.backdrop} saturate(1.8)`

export const primitiveStyles = stylex.create({
  fieldEdge: {
    borderRadius: input.radius,
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  focusContainer: {
    outline: 'none',
  },
  quietFill: {
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': {
        default: color.backgroundNeutralBold,
        [breakpoint.hover]: color.backgroundNeutralBold,
      },
    },
  },
  pressFill: {
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': { default: color.backgroundNeutral, [breakpoint.hover]: color.backgroundNeutral },
    },
  },
  pressFillSubtle: {
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundSurfaceSubtle },
      ':active': { default: color.backgroundNeutral, [breakpoint.hover]: color.backgroundNeutral },
    },
  },
  quietText: {
    color: {
      default: color.textSubtle,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
    },
  },
  hitArea: {
    '::after': {
      content: '""',
      insetBlock: `min(0px, calc((100% - ${layout.hitArea}) / 2))`,
      insetInline: `min(0px, calc((100% - ${layout.hitArea}) / 2))`,
      position: 'absolute',
    },
    position: 'relative',
  },

  selected: {
    backgroundColor: color.backgroundSelected,
    borderColor: color.borderSelected,
    color: color.textSelected,
  },

  forcedEdge: {
    borderStyle: { default: null, [breakpoint.forcedColors]: 'solid' },
    borderColor: { default: null, [breakpoint.forcedColors]: 'CanvasText' },
    borderWidth: { default: null, [breakpoint.forcedColors]: '1px' },
  },

  websiteGlass: {
    backdropFilter: { default: glassBlur, [breakpoint.reducedTransparency]: 'none' },
    backgroundColor: {
      default: color.backgroundOnOverlaySubtle,
      [breakpoint.reducedTransparency]: color.backgroundSurface,
    },
  },
  backdrop: {
    backgroundColor: color.backgroundOverlaySubtle,
    inset: 0,
    isolation: 'isolate',
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    position: 'fixed',
    transitionProperty: 'opacity',
    transitionTimingFunction: motion.ease,
    zIndex: 50,
  },

  modalTransition: {
    transitionDuration: {
      default: motion.durationMedium,
      ':is([data-ending-style])': motion.durationExit,
    },
    transitionTimingFunction: {
      default: motion.ease,
      ':is([data-ending-style])': motion.easeExit,
    },
  },

  sheetTransition: {
    transitionDuration: {
      default: motion.durationSlow,
      ':is([data-ending-style])': motion.durationMedium,
    },
    transitionTimingFunction: {
      default: motion.easeDrawer,
      ':is([data-ending-style])': motion.easeExit,
    },
  },

  modalSurface: {
    backgroundColor: color.backgroundSurface,
    borderColor: { default: null, [breakpoint.forcedColors]: 'CanvasText' },
    borderStyle: { default: null, [breakpoint.forcedColors]: 'solid' },
    borderWidth: { default: null, [breakpoint.forcedColors]: '1px' },
    boxShadow: {
      default: shadow['5'],
      ':focus-visible': layout.focusRing,
    },
    color: color.textBody,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    outline: 'none',
    position: 'fixed',
    transitionTimingFunction: motion.ease,
    zIndex: 50,
  },

  centeredModal: {
    borderRadius: radius.lg,
    display: 'grid',
    gap: space.md,
    bottom: { default: null, [breakpoint.tablet]: 0 },
    height: { default: null, [breakpoint.tablet]: 'fit-content' },
    left: '50%',
    marginBlock: { default: null, [breakpoint.tablet]: 'auto' },
    padding: space.md,
    top: { default: modalTop, [breakpoint.tablet]: 0 },
    transform: {
      default: 'translateX(-50%)',
      ':is([data-starting-style])': 'translateX(-50%) translateY(-4px) scale(0.97)',
      ':is([data-ending-style])': 'translateX(-50%) translateY(-4px) scale(0.97)',
      '@media (prefers-reduced-motion: reduce)': 'translateX(-50%)',
    },
    transformOrigin: { default: 'top center', [breakpoint.tablet]: 'center' },
    transitionProperty: 'opacity, transform',
    width: `calc(100% - ${space.md} * 2)`,
  },

  modalFooter: {
    backgroundColor: color.backgroundSurfaceSubtle,
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    display: 'flex',
    flexDirection: {
      '@media (min-width: 640px)': 'row',
      default: 'column-reverse',
    },
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: {
      '@media (min-width: 640px)': 'flex-end',
      default: 'flex-start',
    },
    padding: space.md,
  },

  modalFooterBleed: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginBottom: `calc(${space.md} * -1)`,
    marginInline: `calc(${space.md} * -1)`,
  },

  modalFooterBleedWide: {
    borderBottomLeftRadius: { default: radius.none, [breakpoint.tablet]: radius.xl },
    borderBottomRightRadius: { default: radius.none, [breakpoint.tablet]: radius.xl },
    marginBottom: `calc(${space.lg} * -1)`,
    marginInline: `calc(${space.lg} * -1)`,
  },

  modalTitle: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeHeading,
    fontWeight: text.weightSemibold,
    lineHeight: text.leadingHeading,
    margin: 0,
  },

  modalDescription: {
    color: color.textSubtle,
    fontSize: text.sizeBody,
    lineHeight: text.leadingBody,
    margin: 0,
  },

  srOnly: {
    borderWidth: 0,
    clipPath: 'inset(50%)',
    height: '1px',
    margin: 0,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },

  innerField: {
    backgroundColor: 'transparent',
    minWidth: 0,
    outline: 'none',
    padding: 0,
  },

  floatingPopup: {
    backgroundColor: color.backgroundSurface,
    borderRadius: radius.md,
    borderWidth: { default: null, [breakpoint.forcedColors]: '1px' },
    borderStyle: { default: null, [breakpoint.forcedColors]: 'solid' },
    borderColor: { default: null, [breakpoint.forcedColors]: 'CanvasText' },
    boxShadow: shadow['4'],
    color: color.textBody,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    outline: 'none',
    overflowY: 'auto',
    padding: space.xxs,
    transform: {
      default: 'none',
      ':is([data-starting-style])': 'scale(0.96)',
      ':is([data-ending-style])': 'scale(0.96)',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transformOrigin: hostContract.transformOrigin,
    transitionDuration: {
      default: motion.durationMedium,
      ':is([data-ending-style])': motion.durationExit,
    },
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: {
      default: motion.ease,
      ':is([data-ending-style])': motion.easeExit,
    },
    zIndex: 50,
  },

  floatingItem: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-highlighted])': color.backgroundNeutral,
    },
    borderRadius: radius.nestMdXxs,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    display: 'flex',
    fontSize: text.sizeStep,
    gap: space.xs,
    lineHeight: text.leadingUi,
    minHeight: layout.stepHeight,
    cursor: { ':is([data-disabled])': cursor.notAllowed, default: cursor.default },
    outline: 'none',
    paddingBlock: space['2xs'],
    paddingInline: space.stepPadding,
    position: 'relative',
    userSelect: 'none',
  },

  floatingItemDefault: {
    color: {
      default: color.textBody,
      ':is([data-highlighted])': color.textDefault,
      ':is([data-disabled])': color.textSubtlest,
    },
  },

  itemIndicator: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    right: space.xs,
    top: '50%',
    transform: 'translateY(-50%)',
  },
})
