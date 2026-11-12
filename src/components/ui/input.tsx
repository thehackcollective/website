import { Input as InputPrimitive } from '@base-ui/react/input'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import { color, layout, space, text } from '@/tokens/token-consts.stylex'
import { fieldStyles } from '@/ui/field.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  input: {
    height: layout.stepHeight,
    minWidth: 0,
    paddingBlock: space.xxs,
  },
  textarea: {
    display: 'flex',
    fieldSizing: 'content',
    minHeight: layout.textareaMinHeight,
    paddingBlock: space.xs,
    resize: 'vertical',
  },
  fixedRows: {
    fieldSizing: 'fixed',
  },
  range: {
    accentColor: color.textDefault,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    height: layout.controlHeightXs,
    padding: 0,
    width: '100%',
  },
  bare: {
    '::placeholder': { color: 'currentColor', opacity: 0.55 },
    borderStyle: 'none',
    borderWidth: 0,
    color: 'inherit',
    flexBasis: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: text.fontSans,
    fontSize: `max(${text.sizeField}, ${text.sizeUi})`,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingUi,
    textOverflow: 'ellipsis',
    width: '100%',
  },
  fileSelector: {
    '::file-selector-button': {
      backgroundColor: 'transparent',
      borderWidth: 0,
      color: color.textDefault,
      fontFamily: text.fontSans,
      fontSize: text.sizeUi,
      fontWeight: text.weightMedium,
      paddingInlineEnd: space.xs,
      paddingInlineStart: 0,
    },
  },
})

export type InputProps = Omit<InputPrimitive.Props, 'className' | 'style' | 'render'>

export function Input({
  variant = 'field',
  ...props
}: InputProps & { variant?: 'field' | 'bare' }) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  if (props.type === 'range') {
    return <InputPrimitive data-slot="input" {...props} {...stylex.props(styles.range)} />
  }
  if (variant === 'bare') {
    return (
      <InputPrimitive
        data-slot="input"
        {...props}
        {...stylex.props(primitiveStyles.innerField, styles.bare)}
      />
    )
  }
  return (
    <InputPrimitive
      data-slot="input"
      data-thc-step="lg"
      {...props}
      {...stylex.props(
        fieldStyles.base,
        fieldStyles.placeholder,
        fieldStyles.paddingInline,
        fieldStyles.focusRing,
        styles.input,
        props.type === 'file' && styles.fileSelector,
        props.readOnly === true && fieldStyles.readOnly,
        invalid && fieldStyles.invalid,
      )}
    />
  )
}

export type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className' | 'style'>

export function Textarea({ ...props }: TextareaProps) {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  return (
    <textarea
      data-slot="textarea"
      {...props}
      {...stylex.props(
        fieldStyles.base,
        fieldStyles.placeholder,
        fieldStyles.paddingInline,
        fieldStyles.focusRing,
        styles.textarea,
        props.rows !== undefined && styles.fixedRows,
        props.readOnly === true && fieldStyles.readOnly,
        invalid && fieldStyles.invalid,
      )}
    />
  )
}
