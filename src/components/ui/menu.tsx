import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import * as stylex from '@stylexjs/stylex'
import type { ReactElement, ReactNode, RefObject } from 'react'
import { Link } from 'react-router'
import { FLUID_ITEM_ATTR, useFluidHover } from '@/lib/hooks/use-fluid-hover'
import { FluidHoverHighlight } from '@/ui/fluid-hover-highlight'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { menuStyles as styles } from '@/ui/menu.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export function Menu({
  open,
  onOpenChange,
  trigger,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  matchTrigger = false,
  container,
  modal,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  matchTrigger?: boolean
  container?: RefObject<HTMLElement | null>
  modal?: boolean
  children: ReactNode
}) {
  const { containerRef, highlightProps, onLeave } = useFluidHover<HTMLDivElement>()

  return (
    <MenuPrimitive.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <MenuPrimitive.Trigger render={trigger} />
      <MenuPrimitive.Portal container={container}>
        <MenuPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          {...stylex.props(styles.positioner)}
        >
          <MenuPrimitive.Popup
            {...stylex.props(
              primitiveStyles.focusContainer,
              styles.popup,
              matchTrigger && styles.popupTriggerWidth,
              primitiveStyles.forcedEdge,
            )}
          >
            <div ref={containerRef} onPointerLeave={onLeave} {...stylex.props(styles.inner)}>
              <FluidHoverHighlight {...highlightProps} corner="nestMdXxs" />
              {children}
            </div>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.label)}>{children}</div>
}

function ItemText({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  if (caption === undefined) return <span {...stylex.props(styles.itemLabel)}>{children}</span>
  return (
    <span {...stylex.props(styles.itemText)}>
      <span {...stylex.props(styles.itemLabel)}>{children}</span>
      <span {...stylex.props(styles.itemLabel, styles.itemCaption)}>{caption}</span>
    </span>
  )
}

export function MenuItem({
  onClick,
  to,
  icon,
  meta,
  caption,
  tone,
  disabled,
  selected = false,
  current = false,
  size = 'lg',
  children,
}: {
  onClick?: () => void
  selected?: boolean
  current?: boolean
  size?: 'md' | 'lg'
  to?: string
  icon?: ReactNode
  meta?: ReactNode
  caption?: ReactNode
  tone?: 'negative'
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <MenuPrimitive.Item
      disabled={disabled}
      onClick={onClick}
      aria-current={current ? 'true' : undefined}
      {...(to === undefined ? {} : { render: <Link to={to} /> })}
      data-thc-step={size}
      {...{ [FLUID_ITEM_ATTR]: '' }}
      {...stylex.props(
        styles.item,
        icon !== undefined && styles.itemLeading,
        size === 'md' && styles.itemBalanced,
        tone === 'negative' && styles.itemNegative,
        disabled === true && styles.itemDisabled,
        selected && styles.itemSelected,
      )}
    >
      {icon}
      <ItemText caption={caption}>{children}</ItemText>
      {meta !== undefined && <span {...stylex.props(styles.itemMeta)}>{meta}</span>}
    </MenuPrimitive.Item>
  )
}

export function MenuSeparator() {
  return <MenuPrimitive.Separator {...stylex.props(styles.separator)} />
}

export function MenuRadioGroup({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <MenuPrimitive.RadioGroup
      aria-label={label}
      value={value}
      onValueChange={(next: unknown) => {
        if (typeof next === 'string') onValueChange(next)
      }}
      {...stylex.props(styles.radioGroup)}
    >
      {children}
    </MenuPrimitive.RadioGroup>
  )
}

function checkItemProps() {
  return {
    'data-thc-step': 'lg',
    [FLUID_ITEM_ATTR]: '',
    ...stylex.props(styles.item, styles.itemLeading),
  }
}

export function MenuRadioItem({
  value,
  caption,
  children,
}: {
  value: string
  caption?: ReactNode
  children: ReactNode
}) {
  return (
    <MenuPrimitive.RadioItem value={value} closeOnClick {...checkItemProps()}>
      <span {...stylex.props(styles.indicatorSlot)}>
        <MenuPrimitive.RadioItemIndicator {...stylex.props(styles.indicator)}>
          <Icon icon={icons.checked} size="fill" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      <ItemText caption={caption}>{children}</ItemText>
    </MenuPrimitive.RadioItem>
  )
}

export function MenuCheckboxItem({
  checked,
  onCheckedChange,
  meta,
  children,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <MenuPrimitive.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...checkItemProps()}
    >
      <span {...stylex.props(styles.indicatorSlot)}>
        <MenuPrimitive.CheckboxItemIndicator {...stylex.props(styles.indicator)}>
          <Icon icon={icons.checked} size="fill" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      <ItemText caption={undefined}>{children}</ItemText>
      {meta !== undefined && <span {...stylex.props(styles.itemMeta)}>{meta}</span>}
    </MenuPrimitive.CheckboxItem>
  )
}
