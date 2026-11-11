import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import * as stylex from '@stylexjs/stylex'

import { color, cursor, layout, motion, radius, space } from '@/tokens/token-consts.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type SwitchSize = 'sm' | 'md'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      ':is([data-checked])': color.backgroundInverseSolid,
      ':is([data-disabled])': color.backgroundNeutral,
      ':is([data-disabled][data-checked])': color.backgroundNeutralBolder,
      default: color.backgroundNeutralBold,
    },
    borderRadius: radius.full,
    borderStyle: 'none',
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    cursor: { ':is([data-disabled])': cursor.notAllowed, default: cursor.pointer },
    display: 'inline-flex',
    flexShrink: 0,
    outline: 'none',
    padding: space.xxs,
    position: 'relative',
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, box-shadow',
    transitionTimingFunction: motion.easeSmooth,
  },

  rootMd: { height: layout.switchHeightMd, width: layout.switchWidthMd },
  rootSm: { height: layout.switchHeightSm, width: layout.switchWidthSm },

  thumb: {
    backgroundColor: color.backgroundSurface,
    borderRadius: radius.full,
    display: 'block',
    pointerEvents: 'none',
    transitionDuration: {
      '@media (prefers-reduced-motion: reduce)': '0s',
      default: motion.durationFast,
    },
    transitionProperty: 'transform',
    transitionTimingFunction: motion.easeInOut,
  },

  thumbMd: {
    height: layout.switchThumbMd,
    transform: { ':is([data-checked])': 'translateX(20px)', default: 'translateX(0)' },
    width: layout.switchThumbMd,
  },
  thumbSm: {
    height: layout.switchThumbSm,
    transform: { ':is([data-checked])': 'translateX(16px)', default: 'translateX(0)' },
    width: layout.switchThumbSm,
  },
})

const rootSizes = { md: styles.rootMd, sm: styles.rootSm } satisfies Record<SwitchSize, unknown>
const thumbSizes = { md: styles.thumbMd, sm: styles.thumbSm } satisfies Record<SwitchSize, unknown>

export type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'className' | 'style' | 'render'> & {
  size?: SwitchSize
}

export function Switch({ size = 'md', ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-size={size}
      data-slot="switch"
      {...props}
      {...stylex.props(styles.root, primitiveStyles.hitArea, rootSizes[size])}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        {...stylex.props(styles.thumb, thumbSizes[size])}
      />
    </SwitchPrimitive.Root>
  )
}
