import { Input as InputPrimitive } from '@base-ui/react/input'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { color, cursor, input, layout, space, text } from '@/tokens/token-consts.stylex'
import type { Rung } from '@/ui/control'
import { fieldStyles } from '@/ui/field.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import type { InputProps } from '@/ui/input'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    boxSizing: 'border-box',
    color: color.iconSubtle,
    cursor: cursor.text,
    display: 'flex',
    gap: space.stepGap,
    height: layout.stepHeight,
    isolation: 'isolate',
    minWidth: 0,
    paddingInlineEnd: space.xxs,
    paddingInlineStart: space.stepInset,
    width: '100%',
    '::after': { zIndex: -1 },
  },
  icon: {
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.stepGlyph,
    width: layout.stepGlyph,
  },
  input: {
    borderWidth: 0,
    color: input.defaultText,
    flex: '1',
    fontFamily: text.fontSans,
    fontSize: `max(${text.sizeField}, ${text.sizeStep})`,
    height: '100%',
    lineHeight: text.leadingUi,
    textOverflow: 'ellipsis',
  },
  inputEmbedded: {
    '::-webkit-search-cancel-button': { appearance: 'none' },
  },
})

export function SearchGlyph({ size = 'step' }: { size?: 'step' | 'sm' | 'md' | 'lg' }) {
  return <Icon icon={icons.search} size={size} />
}

export type SearchFieldSize = 'toolbar' | 'default' | 'large'

const stepForSize: Record<SearchFieldSize, Rung> = {
  default: 'lg',
  large: 'xl',
  toolbar: 'md',
}

export type SearchFieldProps = Omit<InputProps, 'type' | 'size'> & {
  size?: SearchFieldSize
  variant?: 'boxed' | 'bare'
  action?: ReactNode
}

export function SearchField({
  size = 'default',
  variant = 'boxed',
  action,
  ...props
}: SearchFieldProps) {
  return (
    <label
      data-slot="search-field"
      data-thc-step={stepForSize[size]}
      data-size={size}
      {...stylex.props(
        styles.root,
        fieldStyles.surfaceWithin,
        variant === 'bare' && fieldStyles.embedded,
        primitiveStyles.hitArea,
      )}
    >
      <span aria-hidden="true" {...stylex.props(styles.icon)}>
        <Icon icon={icons.search} size="fill" />
      </span>
      <InputPrimitive
        type="search"
        data-slot="search-field-input"
        {...props}
        {...stylex.props(
          fieldStyles.placeholder,
          primitiveStyles.innerField,
          styles.input,
          variant === 'bare' && styles.inputEmbedded,
        )}
      />
      {action}
    </label>
  )
}
