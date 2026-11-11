import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { figureStyles as styles } from '@/ui/figure.stylex'

const HEIGHT_STYLES = {
  sm: styles.heightSm,
  md: styles.heightMd,
  lg: styles.heightLg,
  fit: null,
} as const

export function Figure({
  caption,
  height = 'md',
  alternative,
  children,
}: {
  caption: string
  height?: keyof typeof HEIGHT_STYLES
  alternative?: ReactNode
  children: ReactNode
}) {
  return (
    <figure {...stylex.props(styles.figure)}>
      <div {...stylex.props(styles.viewport, HEIGHT_STYLES[height])}>{children}</div>
      {alternative && <div {...stylex.props(styles.visuallyHidden)}>{alternative}</div>}
      <figcaption {...stylex.props(styles.caption)}>{caption}</figcaption>
    </figure>
  )
}
