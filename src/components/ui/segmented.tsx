import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'
import { segmentedStyles as styles } from '@/ui/segmented.stylex'
import { useControlSize } from '@/ui/size-provider'

interface SegmentedOption {
  value: string
  label: string
  icon?: ReactNode
}

export function Segmented({
  options,
  value,
  onChange,
  tone = 'light',
  fill = false,
  shape = 'step',
  'aria-label': ariaLabel,
}: {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  tone?: 'light' | 'dark'
  fill?: boolean
  shape?: 'step' | 'pill'
  'aria-label': string
}) {
  const size = useControlSize()
  return (
    <ToggleGroup
      aria-label={ariaLabel}
      data-thc-step={size === 'compact' ? 'md' : 'lg'}
      data-slot="segmented"
      value={[value]}
      onValueChange={(next) => {
        const picked = next.at(0)
        if (typeof picked === 'string') onChange(picked)
      }}
      {...stylex.props(
        styles.track,
        tone === 'dark' && styles.trackDark,
        fill && styles.trackFill,
        shape === 'pill' && styles.shapePill,
      )}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          data-composite-item-active={option.value === value ? '' : undefined}
          aria-label={option.icon ? option.label : undefined}
          {...stylex.props(
            styles.option,
            shape === 'pill' && styles.shapePill,
            primitiveStyles.hitArea,
            option.icon !== undefined && styles.optionSquare,
            fill && styles.optionFill,
            tone === 'dark' && styles.optionDark,
            option.value === value && (tone === 'dark' ? styles.selectedDark : styles.selected),
          )}
        >
          {option.icon ?? option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}
