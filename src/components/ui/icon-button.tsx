import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { breakpoint, color, cursor, layout, motion, radius } from '@/tokens/token-consts.stylex'
import type { Rung } from '@/ui/control'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': {
        default: color.backgroundNeutralBold,
        [breakpoint.hover]: color.backgroundNeutralBold,
      },
    },
    borderRadius: radius.step,
    borderWidth: 0,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    color: {
      default: color.textBody,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
      ':disabled': color.textSubtlest,
    },
    cursor: { default: cursor.pointer, ':disabled': cursor.notAllowed },
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.stepHeight,
    justifyContent: 'center',
    outline: 'none',
    padding: 0,
    transform: {
      default: null,
      ':not(:disabled):active': 'scale(0.96)',
      [breakpoint.reducedMotion]: 'none',
    },
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, color, box-shadow, transform',
    transitionTimingFunction: motion.ease,
    width: layout.stepHeight,
  },
})

export function IconButton({
  label,
  icon,
  onClick,
  disabled,
  render,
  size = 'lg',
}: {
  size?: Rung
  label: string
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  render?: useRender.RenderProp
}) {
  return useRender({
    defaultTagName: 'button',
    render,
    props: {
      'aria-label': label,
      'data-thc-step': size,
      type: 'button',
      onClick,
      disabled,
      children: icon,
      ...stylex.props(styles.root, primitiveStyles.hitArea),
    },
  })
}
