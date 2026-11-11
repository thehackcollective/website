import { Button as ButtonPrimitive } from '@base-ui/react/button'
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

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: {
      ':hover': { [breakpoint.hover]: color.backgroundSurfaceHover },
      ':active': {
        default: color.backgroundNeutral,
        [breakpoint.hover]: color.backgroundNeutral,
      },
      ':focus-visible': color.backgroundSurfaceHover,
      default: 'transparent',
    },
    borderRadius: radius.md,
    borderStyle: 'none',
    borderWidth: 0,
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    color: color.textBody,
    cursor: { ':disabled': cursor.notAllowed, default: cursor.pointer },
    display: 'flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    justifyContent: 'flex-start',
    outline: 'none',
    textAlign: 'start',
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, box-shadow',
    transitionTimingFunction: motion.ease,
    width: '100%',
  },
  row: {
    paddingBlock: space.sm,
    paddingInline: space.md,
  },
  tile: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: space.sm,
    paddingBlock: space.md,
    paddingInline: space.md,
  },
  image: {
    aspectRatio: '4 / 3',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.lg,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 0,
    touchAction: 'pan-y',
  },
  cover: {
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.none,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 0,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    borderStyle: 'none',
    borderWidth: '0px',
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    color: color.textSubtle,
    flex: '1',
    flexDirection: 'column',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    gap: space['2xs'],
    justifyContent: 'center',
    minHeight: layout.hitArea,
    minWidth: 0,
    paddingBlock: space.xxs,
    textAlign: 'center',
    transform: {
      default: null,
      ':active': { default: 'scale(0.97)', [breakpoint.reducedMotion]: 'none' },
    },
    transitionDuration: motion.durationFast,
    transitionProperty: 'color, transform',
    transitionTimingFunction: motion.ease,
    width: 'auto',
  },
  tabActive: {
    color: color.textDefault,
  },
})

type PressableProps = Omit<ButtonPrimitive.Props, 'className' | 'style' | 'render'> & {
  surface: 'row' | 'tile' | 'image' | 'cover' | 'tab'
  active?: boolean
  style?: ReadonlyArray<stylex.CompiledStyles | false | null | undefined>
}

export function Pressable({
  surface,
  type = 'button',
  active = false,
  style = [],
  ...props
}: PressableProps) {
  return (
    <ButtonPrimitive
      {...props}
      type={type}
      data-pressable={surface}
      {...stylex.props(
        styles.base,
        styles[surface],
        ...style,
        surface === 'tab' && active && styles.tabActive,
      )}
    />
  )
}
