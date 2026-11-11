import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import * as stylex from '@stylexjs/stylex'

import { color } from '@/tokens/token-consts.stylex'

const styles = stylex.create({
  base: {
    backgroundColor: color.backgroundNeutral,
    flexShrink: 0,
  },
  horizontal: { height: '1px', width: '100%' },
  vertical: { alignSelf: 'stretch', width: '1px' },
})

export type SeparatorProps = Omit<SeparatorPrimitive.Props, 'className' | 'style' | 'render'>

export function Separator({ orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      {...props}
      {...stylex.props(
        styles.base,
        orientation === 'vertical' ? styles.vertical : styles.horizontal,
      )}
    />
  )
}
