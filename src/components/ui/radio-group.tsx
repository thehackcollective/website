import { Radio } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import * as stylex from '@stylexjs/stylex'
import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { spring } from '@/lib/motion'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'
import { radioGroupStyles as styles } from '@/ui/radio-group.stylex'

export function RadioGroup({
  value,
  onValueChange,
  name,
  disabled,
  layout = 'list',
  children,
}: {
  value: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  layout?: 'list' | 'cards' | 'stacked'
  children: ReactNode
}) {
  return (
    <RadioGroupPrimitive
      disabled={disabled}
      name={name}
      onValueChange={(next) => onValueChange?.(String(next))}
      value={value}
      {...stylex.props(
        styles.group,
        layout === 'cards' && styles.cards,
        layout === 'stacked' && styles.stacked,
      )}
    >
      {children}
    </RadioGroupPrimitive>
  )
}

function Dot() {
  const reduce = useReducedMotion()
  return (
    <m.span
      animate={{ opacity: 1, scale: 1 }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      transition={spring.fast}
      {...stylex.props(styles.dot)}
    />
  )
}

export function RadioRow({
  value,
  title,
  meta,
  stacked = false,
  disabled,
}: {
  value: string
  title: ReactNode
  meta?: ReactNode
  stacked?: boolean
  disabled?: boolean
}) {
  return (
    <Radio.Root
      disabled={disabled}
      value={value}
      render={(props, state) => (
        <span
          {...props}
          {...stylex.props(
            primitiveStyles.quietFill,
            styles.row,
            state.checked && styles.rowChecked,
            state.disabled && styles.rowDisabled,
          )}
        >
          <span
            {...stylex.props(
              styles.control,
              state.checked && styles.controlChecked,
              state.disabled && styles.controlDisabled,
            )}
          >
            {state.checked && <Dot />}
          </span>
          <span {...stylex.props(styles.body, stacked && styles.bodyStacked)}>
            <span {...stylex.props(styles.label, state.disabled && styles.labelDisabled)}>
              {title}
            </span>
            {meta}
          </span>
        </span>
      )}
    />
  )
}
