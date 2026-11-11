import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { textStyles as styles } from '@/ui/text.stylex'

interface TextProps {
  children: ReactNode
}

export function Display({ children }: TextProps) {
  return <h1 {...stylex.props(styles.display)}>{children}</h1>
}

export function Title({ children }: TextProps) {
  return <h1 {...stylex.props(styles.title)}>{children}</h1>
}

export function Heading({ children }: TextProps) {
  return <h2 {...stylex.props(styles.heading)}>{children}</h2>
}

export function Body({ children }: TextProps) {
  return <p {...stylex.props(styles.body)}>{children}</p>
}

export function UiText({ children }: TextProps) {
  return <p {...stylex.props(styles.ui)}>{children}</p>
}

export function Caption({ children }: TextProps) {
  return <p {...stylex.props(styles.caption)}>{children}</p>
}
