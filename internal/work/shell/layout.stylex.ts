import * as stylex from '@stylexjs/stylex'
import { color, layout, space } from '@/tokens/token-consts.stylex'

export const layoutStyles = stylex.create({
  propertyShell: {
    backgroundColor: color.backgroundCanvas,
    display: 'flex',
    height: '100dvh',
    maxHeight: '100dvh',
    overflow: 'hidden',
  },
  propertyContent: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  main: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minHeight: 0,
    paddingBottom: space.safeBottom,
    paddingInline: space.gutter,
    overflowX: 'hidden',
    overflowY: 'auto',
    overscrollBehaviorY: 'contain',
  },
  mainAboveTabBar: {
    paddingBottom: `calc(${layout.tabBarHeight} + ${space.safeBottom})`,
  },
  frame: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 0,
    paddingBlockStart: space.pageTop,
    width: '100%',
  },
  route: {
    containerType: 'inline-size',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 0,
    width: '100%',
  },
  routeFocus: {
    marginInline: 'auto',
    maxWidth: layout.columnFocus,
  },
})
