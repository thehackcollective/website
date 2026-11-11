import * as stylex from '@stylexjs/stylex'

import { breakpoint, color, layout, motion, space, text } from '@/tokens/token-consts.stylex'

export const pageHeaderVars = stylex.defineVars({
  height: layout.pageHeaderHeight,
})

export const pageHeaderStyles = stylex.create({
  header: {
    alignSelf: 'stretch',
    gridColumn: '1 / -1',
    marginBottom: 0,
  },

  sentinel: {
    height: '1px',
    insetInlineStart: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: `calc(-1 * ${space.pageTop})`,
    width: '1px',
  },
  sticky: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    isolation: 'isolate',
    justifyContent: 'center',
    marginTop: `calc(-1 * ${space.pageTop})`,
    paddingBlockEnd: space.xs,
    paddingBlockStart: space.pageTop,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  surfaceLayer: {
    backgroundColor: color.backgroundCanvas,
    borderBottomColor: color.borderDefault,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    inset: 0,
    left: `calc(-1 * ${space.gutter})`,
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: `calc(-1 * ${space.gutter})`,
    transitionDuration: { default: motion.durationMedium, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'opacity',
    transitionTimingFunction: motion.ease,
    zIndex: -1,
  },
  surfaceLayerShown: {
    opacity: 1,
  },

  content: {
    alignItems: 'center',
    columnGap: space.md,
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: layout.pageHeaderHeight,
    rowGap: space.xs,
  },

  titleRow: {
    alignItems: 'center',
    marginInlineEnd: 'auto',
    minHeight: layout.pageHeaderHeight,
    columnGap: space.xs,
    display: 'flex',
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeDisplay,
    fontWeight: text.weightSemibold,
    letterSpacing: text.trackingDisplay,
    lineHeight: text.leadingDisplay,
    marginBlock: 0,
    marginInline: 0,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tabs: {
    alignItems: 'baseline',
    columnGap: space.lg,
    display: 'flex',
    minWidth: 0,
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  tabCurrent: {
    flexShrink: 0,
  },
  tabSize: {
    fontSize: { default: text.sizeTitle, [breakpoint.tablet]: text.sizeDisplay },
  },
  tab: {
    color: {
      default: color.textSubtle,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
      ':focus-visible': color.textDefault,
    },
    flexShrink: 0,
    outline: 'none',
    textDecorationLine: { default: 'none', ':focus-visible': 'underline' },
    textUnderlineOffset: space['3xs'],
    transitionDuration: { default: motion.durationFast, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'color',
    transitionTimingFunction: motion.ease,
  },
  toggles: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: space.xs,
    maxWidth: '100%',
    minWidth: 0,
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
})
