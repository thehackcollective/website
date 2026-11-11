import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import { color, space, text } from '@/tokens/token-consts.stylex'

const styles = stylex.create({
  label: {
    alignItems: 'center',
    color: color.textDefault,
    display: 'flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontWeight: text.weightMedium,
    gap: space.xs,
    lineHeight: text.leadingUi,
    userSelect: 'none',
  },
})

export type LabelProps = Omit<React.ComponentProps<'label'>, 'className' | 'style'>

export function Label({ ...props }: LabelProps) {
  return <label data-slot="label" {...props} {...stylex.props(styles.label)} />
}
