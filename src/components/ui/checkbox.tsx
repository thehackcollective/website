import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { breakpoint, color, cursor, layout, motion, radius } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      ':is([data-checked])': color.backgroundInverseSolid,
      ':is([data-disabled])': color.backgroundSurfaceSubtle,
      ':is([data-disabled][data-checked])': color.backgroundNeutralBolder,
      default: 'transparent',
    },
    borderColor: {
      ':is([data-checked])': color.backgroundInverseSolid,
      ':is([data-disabled])': color.borderDefault,
      ':is([data-disabled][data-checked])': color.backgroundNeutralBolder,
      default: color.borderInput,
    },
    borderRadius: radius.xs,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    color: color.textInverse,
    cursor: { ':is([data-disabled])': cursor.notAllowed, default: cursor.pointer },
    display: 'flex',
    flexShrink: 0,
    height: layout.checkboxSize,
    justifyContent: 'center',
    outline: 'none',
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionTimingFunction: motion.easeSmooth,
    width: layout.checkboxSize,
  },

  invalid: {
    borderColor: {
      ':is([data-checked])': color.backgroundInverseSolid,
      default: color.borderDanger,
    },
  },

  hitArea: {
    '::after': {
      content: '""',
      insetBlock: { default: '-8px', [breakpoint.coarse]: layout.hitInset },
      insetInline: { default: '-8px', [breakpoint.coarse]: layout.hitInset },
      position: 'absolute',
    },
    position: 'relative',
  },

  indicator: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
})

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'className' | 'style' | 'render'> & {
  indicator?: React.ReactNode
}

export function Checkbox({ indicator, ...props }: CheckboxProps) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...props}
      {...stylex.props(styles.root, styles.hitArea, invalid && styles.invalid)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        {...stylex.props(styles.indicator)}
      >
        {indicator ?? (
          <Icon icon={props.indeterminate === true ? icons.partial : icons.checked} size="fill" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
