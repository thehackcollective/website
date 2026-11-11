import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'

export function DefinitionFact({
  containerStyle,
  containerExtraStyle,
  labelStyle,
  valueStyle,
  leading,
  label,
  value,
}: {
  containerStyle: stylex.StyleXStyles
  containerExtraStyle?: stylex.StyleXStyles | false
  labelStyle: stylex.StyleXStyles
  valueStyle: stylex.StyleXStyles
  leading?: ReactNode
  label: ReactNode
  value: ReactNode
}) {
  return (
    <div {...stylex.props(containerStyle, containerExtraStyle)}>
      {leading}
      <dt {...stylex.props(labelStyle)}>{label}</dt>
      <dd {...stylex.props(valueStyle)}>{value}</dd>
    </div>
  )
}
