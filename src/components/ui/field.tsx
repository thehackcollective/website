import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'

import { color, space, text } from '@/tokens/token-consts.stylex'
import { InlineError } from '@/ui/inline-error'
import { Label } from '@/ui/label'

const styles = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    minWidth: 0,
    width: '100%',
  },
  horizontal: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  labelRow: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xxs,
    height: text.leadingUi,
    minWidth: 0,
  },
  description: {
    color: color.textSubtle,
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingUi,
    margin: 0,
  },
})

export type FieldProps = {
  label: ReactNode
  labelAction?: ReactNode
  htmlFor?: string
  description?: ReactNode
  descriptionId?: string
  error?: ReactNode
  errorId?: string
  orientation?: 'vertical' | 'horizontal'
  children: ReactNode
}

export function Field({
  label,
  labelAction,
  htmlFor,
  description,
  descriptionId,
  error,
  errorId,
  orientation = 'vertical',
  children,
}: FieldProps) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      {...stylex.props(styles.field, orientation === 'horizontal' && styles.horizontal)}
    >
      {labelAction === undefined ? (
        <Label htmlFor={htmlFor}>{label}</Label>
      ) : (
        <div {...stylex.props(styles.labelRow)}>
          <Label htmlFor={htmlFor}>{label}</Label>
          {labelAction}
        </div>
      )}
      {children}
      {description !== undefined && description !== null && (
        <p id={descriptionId} data-slot="field-description" {...stylex.props(styles.description)}>
          {description}
        </p>
      )}
      <InlineError {...(errorId === undefined ? {} : { id: errorId })}>{error}</InlineError>
    </div>
  )
}
