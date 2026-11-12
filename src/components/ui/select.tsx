import { Select as SelectPrimitive } from '@base-ui/react/select'
import * as stylex from '@stylexjs/stylex'

import {
  breakpoint,
  color,
  cursor,
  hostContract,
  input,
  layout,
  motion,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export const Select = SelectPrimitive.Root

export type SelectValueProps = Omit<SelectPrimitive.Value.Props, 'className' | 'style' | 'render'>

export function SelectValue(props: SelectValueProps) {
  return (
    <SelectPrimitive.Value data-slot="select-value" {...props} {...stylex.props(styles.value)} />
  )
}

export type SelectTriggerSize = 'sm' | 'default'

export type SelectTriggerProps = Omit<
  SelectPrimitive.Trigger.Props,
  'className' | 'style' | 'render'
> & {
  size?: SelectTriggerSize
}

export function SelectTrigger({ size = 'default', children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-thc-step={size === 'sm' ? 'md' : 'lg'}
      data-size={size}
      data-slot="select-trigger"
      {...props}
      {...stylex.props(
        primitiveStyles.fieldEdge,
        styles.trigger,
        primitiveStyles.hitArea,
        styles.focusRing,
      )}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon" {...stylex.props(styles.triggerIcon)}>
        <Icon icon={icons.picker} size="md" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export type SelectContentProps = Omit<
  SelectPrimitive.Popup.Props,
  'className' | 'style' | 'render'
> &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >

export function SelectContent({
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        {...stylex.props(styles.positioner)}
      >
        <SelectPrimitive.Popup
          data-align-trigger={alignItemWithTrigger}
          data-slot="select-content"
          {...props}
          {...stylex.props(primitiveStyles.floatingPopup, styles.content)}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export type SelectItemProps = Omit<SelectPrimitive.Item.Props, 'className' | 'style' | 'render'>

export function SelectItem({ children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-thc-step="lg"
      data-slot="select-item"
      {...props}
      {...stylex.props(
        primitiveStyles.floatingItem,
        primitiveStyles.floatingItemDefault,
        styles.item,
      )}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text" {...stylex.props(styles.itemText)}>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        {...stylex.props(primitiveStyles.itemIndicator)}
      >
        <span data-checked {...stylex.props(styles.itemTick)}>
          <Icon icon={icons.checked} size="md" />
        </span>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectScrollUpButtonProps = Omit<
  SelectPrimitive.ScrollUpArrow.Props,
  'className' | 'style' | 'render'
>

function SelectScrollUpButton(props: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      {...props}
      {...stylex.props(styles.scrollButton, styles.scrollUp)}
    >
      <Icon icon={icons.scrollUp} size="md" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

type SelectScrollDownButtonProps = Omit<
  SelectPrimitive.ScrollDownArrow.Props,
  'className' | 'style' | 'render'
>

function SelectScrollDownButton(props: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      {...props}
      {...stylex.props(styles.scrollButton, styles.scrollDown)}
    >
      <Icon icon={icons.scrollDown} size="md" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

const styles = stylex.create({
  value: {
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  trigger: {
    alignItems: 'center',
    backgroundColor: { ':disabled': color.backgroundSurfaceSubtle, default: 'transparent' },
    borderColor: {
      ':hover': { [breakpoint.hover]: color.borderBold },
      ':active': { default: color.borderBolder, [breakpoint.hover]: color.borderBolder },
      default: input.defaultBorder,
    },
    color: { ':disabled': color.textSubtlest, default: color.textDefault },
    cursor: { ':disabled': cursor.notAllowed, default: cursor.pointer },
    display: 'flex',
    fontFamily: text.fontSans,
    fontSize: `max(${text.sizeField}, ${text.sizeStep})`,
    gap: space.stepGap,
    height: layout.stepHeight,
    justifyContent: 'space-between',
    outline: 'none',
    paddingInlineEnd: space.stepInset,
    paddingInlineStart: space.stepPadding,
    transitionDuration: motion.durationFast,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionTimingFunction: motion.easeSmooth,
    whiteSpace: 'nowrap',
    width: '100%',
  },

  focusRing: {
    borderColor: { ':focus-visible': input.defaultBorderFocus, default: null },
    boxShadow: { ':focus-visible': layout.focusRingField, default: null },
  },

  triggerIcon: {
    alignItems: 'center',
    color: color.textSubtle,
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.stepGlyph,
    justifyContent: 'center',
    width: layout.stepGlyph,
  },

  positioner: {
    isolation: 'isolate',
    zIndex: 50,
  },

  content: {
    maxHeight: `min(20rem, ${hostContract.availableHeight})`,
    maxWidth: layout.popoverWidth,
    minWidth: `max(${layout.popupMinWidth}, ${hostContract.anchorWidth})`,
  },

  item: {
    paddingInlineEnd: space.xl,
    width: '100%',
  },

  itemText: {
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
    gap: space.xs,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  itemTick: {
    visibility: { default: 'hidden', ':is([data-checked])': 'visible' },
  },

  scrollButton: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    color: color.textSubtle,
    cursor: cursor.default,
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: space.xs,
    width: '100%',
    zIndex: 10,
  },

  scrollUp: {
    top: 0,
  },

  scrollDown: {
    bottom: 0,
  },
})

export interface OptionSelectItem<Value extends string = string> {
  value: Value
  label: string
  disabled?: boolean
}

export function OptionSelect<Value extends string>({
  items,
  value,
  label,
  placeholder,
  size = 'sm',
  id,
  name,
  required = false,
  disabled = false,
  invalid,
  describedBy,
  onChange,
}: {
  items: readonly OptionSelectItem<Value>[]
  value: Value | null
  label: string
  placeholder?: string | undefined
  size?: SelectTriggerSize
  id?: string | undefined
  name?: string | undefined
  required?: boolean
  disabled?: boolean
  invalid?: true | undefined
  describedBy?: string | undefined
  onChange: (value: Value) => void
}) {
  return (
    <Select
      items={[...items]}
      value={value}
      name={name}
      required={required}
      disabled={disabled}
      onValueChange={(next) => {
        const item = items.find((option) => option.value === next)
        if (item !== undefined) onChange(item.value)
      }}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
