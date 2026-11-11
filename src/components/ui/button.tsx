import { Button as ButtonPrimitive } from '@base-ui/react/button'
import * as stylex from '@stylexjs/stylex'
import type { ComponentProps, ReactNode } from 'react'
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
import type { Rung } from '@/ui/control'
import { Icon } from '@/ui/icon'
import { iconEdges } from '@/ui/icon-edges'
import { icons } from '@/ui/icons'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type ButtonVariant =
  | 'primary'
  | 'strong'
  | 'secondary'
  | 'ghost'
  | 'quiet'
  | 'bare'
  | 'overlay'
  | 'destructive'
  | 'destructiveGhost'
  | 'outline'
  | 'link'

export type ButtonSize =
  | 'inline'
  | 'xs'
  | 'sm'
  | 'touch'
  | 'md'
  | 'lg'
  | 'icon'
  | 'iconTouch'
  | 'iconHit'

export type ButtonShape = 'step' | 'pill'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

const styles = stylex.create({
  base: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    cursor: { ':disabled': cursor.notAllowed, default: cursor.pointer },
    display: 'inline-flex',
    flexShrink: 0,
    borderRadius: radius.step,
    fontFamily: text.fontSans,
    fontSize: text.sizeStep,
    fontWeight: text.weightMedium,
    gap: space.stepGap,
    height: layout.stepHeight,
    justifyContent: 'center',
    outline: 'none',
    paddingInline: space.stepPadding,
    textDecorationLine: 'none',
    transform: {
      default: null,
      ':not(:disabled):active': 'translateY(1px)',
      [breakpoint.reducedMotion]: 'none',
    },
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, color, box-shadow, transform',
    transitionTimingFunction: motion.easeSmooth,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },

  primary: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.primaryBackgroundHover },
      ':active': {
        default: button.primaryBackgroundActive,
        [breakpoint.hover]: button.primaryBackgroundActive,
      },
      default: button.primaryBackground,
    },
    color: button.primaryText,
  },
  strong: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.strongBackgroundHover },
      ':active': {
        default: color.backgroundInverseBold,
        [breakpoint.hover]: color.backgroundInverseBold,
      },
      default: button.strongBackground,
    },
    color: button.strongText,
  },
  secondary: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.secondaryBackgroundHover },
      ':active': {
        default: color.backgroundNeutral,
        [breakpoint.hover]: color.backgroundNeutral,
      },
      default: button.secondaryBackground,
    },
    borderColor: button.secondaryBorder,
    color: button.secondaryText,
  },
  ghost: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: color.backgroundNeutral },
      ':active': {
        default: color.backgroundNeutralBold,
        [breakpoint.hover]: color.backgroundNeutralBold,
      },
      default: color.backgroundNeutralHover,
    },
    color: button.ghostText,
  },
  quiet: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': { default: color.backgroundNeutral, [breakpoint.hover]: color.backgroundNeutral },
      default: 'transparent',
    },
    color: {
      default: button.ghostText,
      ':hover': { [breakpoint.hover]: color.textDefault },
      ':active': { default: color.textDefault, [breakpoint.hover]: color.textDefault },
    },
  },
  bare: {
    backgroundColor: 'transparent',
    color: { default: button.ghostText, ':active': color.textDefault },
  },
  overlay: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.overlayBackgroundHover },
      ':active': {
        default: color.backgroundOnOverlay,
        [breakpoint.hover]: color.backgroundOnOverlay,
      },
      default: button.overlayBackground,
    },
    color: button.overlayText,
  },
  destructive: {
    backgroundColor: {
      ':hover': {
        [breakpoint.hover]: color.backgroundDangerSubtle,
      },
      ':active': {
        default: color.backgroundDangerTint,
        [breakpoint.hover]: color.backgroundDangerTint,
      },
      default: button.destructiveBackground,
    },
    color: color.textDanger,
  },
  destructiveGhost: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.ghostBackgroundHover },
      ':active': {
        default: color.backgroundNeutral,
        [breakpoint.hover]: color.backgroundNeutral,
      },
      default: 'transparent',
    },
    color: color.textDanger,
  },
  outline: {
    backgroundColor: {
      ':hover': { [breakpoint.hover]: button.outlineBackgroundHover },
      ':active': {
        default: color.backgroundNeutral,
        [breakpoint.hover]: color.backgroundNeutral,
      },
      default: 'transparent',
    },
    borderColor: button.outlineBorder,
    color: button.outlineText,
  },
  wrap: {
    flexShrink: 1,
    height: 'auto',
    justifyContent: 'flex-start',
    minHeight: layout.stepHeight,
    minWidth: 0,
    textAlign: 'start',
    whiteSpace: 'normal',
    width: '100%',
  },
  link: {
    backgroundColor: 'transparent',
    color: button.linkText,
    paddingInline: 0,
    textDecorationLine: 'underline',
    textUnderlineOffset: '0.2em',
  },

  disabledFilled: {
    backgroundColor: color.backgroundNeutral,
    borderColor: 'transparent',
    color: color.textSubtlest,
  },
  disabledQuiet: {
    backgroundColor: 'transparent',
    color: color.textSubtlest,
    textDecorationLine: 'none',
  },
  loading: { cursor: cursor.progress, pointerEvents: 'none' },
  loadingLabel: { color: 'transparent', display: 'contents' },
  spinner: {
    alignItems: 'center',
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
  },
  spinnerGlyph: {
    animationDuration: motion.durationLoop,
    animationIterationCount: 'infinite',
    animationName: { default: spin, [breakpoint.reducedMotion]: 'none' },
    animationTimingFunction: 'linear',
    display: 'inline-flex',
  },

  inline: { borderWidth: 0, fontSize: text.sizeUi, height: 'auto', paddingInline: 0 },
  leading: { paddingInlineStart: space.stepInset },
  trailing: { paddingInlineEnd: space.stepInset },
  square: { paddingInline: 0, width: layout.stepHeight },
  hit: { height: layout.hitArea, width: layout.hitArea },
  shapePill: { borderRadius: radius.pill },
})

const variantStyles = {
  destructive: styles.destructive,
  destructiveGhost: styles.destructiveGhost,
  ghost: styles.ghost,
  quiet: styles.quiet,
  bare: styles.bare,
  link: styles.link,
  outline: styles.outline,
  overlay: styles.overlay,
  primary: styles.primary,
  secondary: styles.secondary,
  strong: styles.strong,
}

const quietVariants: ReadonlySet<ButtonVariant> = new Set([
  'bare',
  'ghost',
  'quiet',
  'destructiveGhost',
  'outline',
  'link',
])

const stepForSize: Record<ButtonSize, Rung | undefined> = {
  icon: 'md',
  iconTouch: 'lg',
  iconHit: 'md',
  inline: undefined,
  lg: 'xl',
  md: 'lg',
  sm: 'md',
  touch: 'md',
  xs: 'sm',
}

export type ButtonProps = Omit<
  ButtonPrimitive.Props,
  'aria-pressed' | 'className' | 'style' | 'render'
> & {
  variant?: ButtonVariant
  size?: ButtonSize
  pressed?: boolean
  pressedAppearance?: 'selected' | 'plain'
  wrap?: boolean
  shape?: ButtonShape
  loading?: boolean
  render?: ButtonPrimitive.Props['render']
}

type ButtonLook = {
  pressed?: boolean | undefined
  pressedAppearance?: ButtonProps['pressedAppearance']
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  wrap?: boolean | undefined
  shape?: ButtonShape | undefined
  disabled?: boolean | undefined
  loading?: boolean | undefined
  children?: ReactNode
}

function buttonLook({
  variant = 'primary',
  size = 'md',
  pressed,
  pressedAppearance = 'selected',
  wrap,
  shape = 'step',
  disabled,
  loading,
  children,
}: ButtonLook) {
  const edges = iconEdges(children)
  const square = edges.square || size === 'icon' || size === 'iconTouch' || size === 'iconHit'
  return {
    'data-thc-step': stepForSize[size],
    'data-size': size,
    'data-slot': 'button',
    'data-variant': variant,
    ...stylex.props(
      styles.base,
      primitiveStyles.hitArea,
      variantStyles[variant],
      size === 'inline' && styles.inline,
      edges.leading && styles.leading,
      edges.trailing && styles.trailing,
      square && size !== 'inline' && styles.square,
      size === 'iconHit' && styles.hit,
      wrap && styles.wrap,
      shape === 'pill' && styles.shapePill,
      pressed && pressedAppearance === 'selected' && primitiveStyles.selected,
      disabled &&
        !loading &&
        (quietVariants.has(variant) ? styles.disabledQuiet : styles.disabledFilled),
      loading && styles.loading,
    ),
  }
}

export function Button({
  variant,
  size,
  pressed,
  pressedAppearance,
  wrap,
  shape,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      {...props}
      aria-busy={loading ? true : props['aria-busy']}
      {...(pressed === undefined ? {} : { 'aria-pressed': pressed })}
      data-loading={loading ? '' : undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || props.focusableWhenDisabled}
      {...buttonLook({
        children,
        size,
        variant,
        pressed,
        pressedAppearance,
        wrap,
        shape,
        disabled,
        loading,
      })}
    >
      {loading ? (
        <>
          <span {...stylex.props(styles.loadingLabel)}>{children}</span>
          <span aria-hidden {...stylex.props(styles.spinner)}>
            <span {...stylex.props(styles.spinnerGlyph)}>
              <Icon icon={icons.loading} />
            </span>
          </span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export type ButtonLinkProps = Omit<ComponentProps<'a'>, 'className' | 'style'> &
  Pick<ButtonLook, 'variant' | 'size' | 'shape'>

export function ButtonLink({ variant, size, shape, ...props }: ButtonLinkProps) {
  return <a {...props} {...buttonLook({ children: props.children, size, variant, shape })} />
}
