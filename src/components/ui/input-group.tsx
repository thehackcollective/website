import { Input as InputPrimitive } from '@base-ui/react/input'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import {
  breakpoint,
  color,
  cursor,
  input,
  layout,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { fieldStyles } from '@/ui/field.stylex'
import type { InputProps } from '@/ui/input'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  group: {
    alignItems: 'center',
    backgroundColor: { ':has(input:disabled)': input.defaultBackgroundDisabled, default: null },
    borderColor: {
      ':focus-within': input.defaultBorderFocus,
      ':has([aria-invalid="true"])': input.defaultBorderInvalid,
      ':hover': { [breakpoint.hover]: color.borderBold },
      default: input.defaultBorder,
    },
    display: 'flex',
    flexWrap: 'wrap',
    minWidth: 0,
    boxShadow: { ':focus-within': layout.focusRingField, default: null },
    width: '100%',
  },
  fieldGroup: {
    boxSizing: 'border-box',
    minHeight: layout.stepHeight,
  },
  hitBehind: {
    '::after': { zIndex: -1 },
    isolation: 'isolate',
  },
  toolbarGroup: {
    boxSizing: 'border-box',
    flexWrap: 'nowrap',
    height: layout.controlHeightMd,
  },

  inlineStart: {
    order: 1,
  },
  inlineEnd: {
    order: 3,
  },
  blockStart: {
    order: 1,
    width: '100%',
  },
  blockEnd: {
    order: 3,
    width: '100%',
  },

  addon: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurfaceSubtle,
    color: color.textSubtle,
    cursor: cursor.text,
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    gap: space.xs,
    justifyContent: 'center',
    paddingBlock: space.xs,
    paddingInline: space.sm,
    userSelect: 'none',
  },
  plainAddon: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    color: color.textSubtle,
    paddingBlock: 0,
    paddingInlineEnd: space.xs,
    paddingInlineStart: space.sm,
  },
  addonInline: {
    borderColor: color.borderInput,
    borderStyle: 'solid',
    borderWidth: '1px',
    flexShrink: 0,
  },
  addonInlineStart: {
    borderRightWidth: 0,
    borderTopLeftRadius: input.radius,
    borderBottomLeftRadius: input.radius,
  },
  addonInlineEnd: {
    borderLeftWidth: 0,
    borderTopRightRadius: input.radius,
    borderBottomRightRadius: input.radius,
  },
  addonBlock: {
    borderColor: color.borderInput,
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  addonBlockStart: {
    borderBottomWidth: 0,
    borderTopLeftRadius: input.radius,
    borderTopRightRadius: input.radius,
    justifyContent: 'flex-start',
  },
  addonBlockEnd: {
    borderTopWidth: 0,
    borderBottomLeftRadius: input.radius,
    borderBottomRightRadius: input.radius,
    justifyContent: 'flex-start',
  },

  input: {
    borderWidth: 0,
    borderRadius: radius.none,
    boxShadow: 'none',
    flex: '1',
    alignSelf: 'stretch',
    minWidth: '80px',
    order: 2,
  },
  toolbarInput: {
    boxSizing: 'border-box',
    height: '100%',
    paddingBlock: 0,
    paddingInlineStart: 0,
  },
})

const alignStyles = {
  'block-end': styles.blockEnd,
  'block-start': styles.blockStart,
  'inline-end': styles.inlineEnd,
  'inline-start': styles.inlineStart,
} satisfies Record<InputGroupAddonAlign, unknown>

const addonAlignStyles = {
  'block-end': styles.addonBlockEnd,
  'block-start': styles.addonBlockStart,
  'inline-end': styles.addonInlineEnd,
  'inline-start': styles.addonInlineStart,
} satisfies Record<InputGroupAddonAlign, unknown>

const isBlock = (align: InputGroupAddonAlign) => align === 'block-end' || align === 'block-start'

export type InputGroupAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end'

export type InputGroupProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & {
  size?: 'default' | 'toolbar'
}

export function InputGroup({ size = 'default', ...props }: InputGroupProps) {
  return (
    <div
      data-size={size}
      data-thc-step={size === 'toolbar' ? undefined : 'lg'}
      data-slot="input-group"
      role="group"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        if (event.target === event.currentTarget)
          event.currentTarget.querySelector('input')?.focus()
      }}
      {...stylex.props(
        primitiveStyles.fieldEdge,
        styles.group,
        primitiveStyles.hitArea,
        styles.hitBehind,
        size === 'toolbar' ? styles.toolbarGroup : styles.fieldGroup,
      )}
    />
  )
}

export type InputGroupAddonAlign = InputGroupAlign

export type InputGroupAddonProps = Omit<
  React.ComponentProps<'button'>,
  'className' | 'style' | 'type'
> & {
  align?: InputGroupAlign
  variant?: 'default' | 'plain'
}

export function InputGroupAddon({
  align = 'inline-start',
  variant = 'default',
  ...props
}: InputGroupAddonProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      data-align={align}
      data-slot="input-group-addon"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented)
          event.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...stylex.props(
        styles.addon,
        isBlock(align) ? styles.addonBlock : styles.addonInline,
        addonAlignStyles[align],
        alignStyles[align],
        variant === 'plain' && styles.plainAddon,
      )}
    />
  )
}

export function InputGroupInput({
  controlSize = 'default',
  ...props
}: InputProps & { controlSize?: 'default' | 'toolbar' }) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  return (
    <InputPrimitive
      data-slot="input-group-control"
      {...props}
      {...stylex.props(
        fieldStyles.base,
        fieldStyles.placeholder,
        fieldStyles.paddingInline,
        fieldStyles.focusRing,
        invalid && fieldStyles.invalid,
        styles.input,
        controlSize === 'toolbar' && styles.toolbarInput,
      )}
    />
  )
}
