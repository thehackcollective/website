import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import {
  breakpoint,
  color,
  hostContract,
  layout,
  motion,
  radius,
  shadow,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  positioner: {
    zIndex: 50,
  },
  popup: {
    backgroundColor: color.backgroundSurface,
    borderRadius: radius.md,
    boxShadow: shadow['4'],
    color: color.textDefault,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: text.fontSans,
    gap: space.xs,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 0,
      ':is([data-ending-style])': 0,
    },
    padding: space.md,
    transform: {
      default: 'none',
      ':is([data-starting-style])': 'scale(0.96)',
      ':is([data-ending-style])': 'scale(0.96)',
      [breakpoint.reducedMotion]: 'none',
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
    width: layout.popoverWidth,
  },
  title: {
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingUi,
    margin: 0,
  },
  description: {
    color: color.textSubtle,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    margin: 0,
  },
})

export type PopoverProps = Omit<PopoverPrimitive.Root.Props, 'className' | 'style' | 'render'>

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

export type PopoverTriggerProps = Omit<PopoverPrimitive.Trigger.Props, 'className' | 'style'>

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export type PopoverContentProps = Omit<
  PopoverPrimitive.Popup.Props,
  'className' | 'style' | 'render'
> &
  Pick<PopoverPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>

export function PopoverContent({
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={8}
        {...stylex.props(styles.positioner)}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          {...props}
          {...stylex.props(
            primitiveStyles.focusContainer,
            styles.popup,
            primitiveStyles.forcedEdge,
          )}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export type PopoverTitleProps = Omit<PopoverPrimitive.Title.Props, 'className' | 'style'>

export function PopoverTitle(props: PopoverTitleProps) {
  return (
    <PopoverPrimitive.Title data-slot="popover-title" {...props} {...stylex.props(styles.title)} />
  )
}

export type PopoverDescriptionProps = Omit<
  PopoverPrimitive.Description.Props,
  'className' | 'style'
>

export function PopoverDescription(props: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      {...props}
      {...stylex.props(styles.description)}
    />
  )
}
