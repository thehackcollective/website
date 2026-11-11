import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  hostContract,
  motion,
  radius,
  shadow,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type TooltipProviderProps = Omit<
  TooltipPrimitive.Provider.Props,
  'className' | 'style' | 'render'
>

export function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />
}

export type TooltipProps = Omit<TooltipPrimitive.Root.Props, 'className' | 'style' | 'render'>

export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

export type TooltipTriggerProps = Omit<TooltipPrimitive.Trigger.Props, 'className' | 'style'>

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export type TooltipContentProps = Omit<
  TooltipPrimitive.Popup.Props,
  'className' | 'style' | 'render'
> &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>

export function TooltipContent({
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          {...props}
          {...stylex.props(styles.content, primitiveStyles.forcedEdge)}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

const styles = stylex.create({
  positioner: {
    isolation: 'isolate',
    zIndex: 60,
  },

  content: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    borderRadius: radius.md,
    boxShadow: shadow['4'],
    color: color.textDefault,
    display: 'inline-flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    gap: space.xs,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    paddingBlock: space.xs,
    paddingInline: space.sm,
    transform: {
      default: 'none',
      ':is([data-starting-style])': 'scale(0.96)',
      ':is([data-ending-style])': 'scale(0.96)',
      [breakpoint.reducedMotion]: 'none',
    },
    transformOrigin: hostContract.transformOrigin,
    transitionDuration: {
      default: motion.durationFast,
      ':is([data-instant])': '0ms',
    },
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: motion.ease,
    zIndex: 60,
  },
})
