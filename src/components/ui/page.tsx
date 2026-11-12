import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { AsyncContent, type AsyncContentProps } from '@/ui/async-content'
import { pageStyles as styles } from '@/ui/page.stylex'
import { Body, Caption, Heading } from '@/ui/text'

export function Page({
  prose,
  contained,
  focus,
  children,
}: {
  prose?: boolean
  contained?: boolean
  focus?: boolean
  children: ReactNode
}) {
  return (
    <div
      {...stylex.props(
        styles.page,
        contained && styles.contained,
        prose && styles.pageProse,
        focus && styles.focus,
      )}
    >
      {children}
    </div>
  )
}

const spanStyles = {
  4: styles.span4,
  5: styles.span5,
  6: styles.span6,
  7: styles.span7,
  8: styles.span8,
  12: styles.span12,
} as const

export function PageSpan({
  span = 12,
  children,
}: {
  span?: keyof typeof spanStyles
  children: ReactNode
}) {
  return <div {...stylex.props(spanStyles[span])}>{children}</div>
}

type SectionProps = Partial<AsyncContentProps> & {
  span?: 4 | 5 | 6 | 7 | 8 | 12
  heading: string
  caption?: string
  actions?: ReactNode
}

export function Section({
  span = 12,
  heading,
  caption,
  actions,
  loading = false,
  children,
  ...state
}: SectionProps) {
  return (
    <section {...stylex.props(styles.section, spanStyles[span])}>
      <div {...stylex.props(styles.sectionHead)}>
        <div {...stylex.props(styles.sectionHeadRow)}>
          <Heading>{heading}</Heading>
          {actions && <div {...stylex.props(styles.sectionActions)}>{actions}</div>}
        </div>
        {caption && <Caption>{caption}</Caption>}
      </div>
      <div {...stylex.props(styles.sectionBody)}>
        <AsyncContent loading={loading} {...state}>
          <div {...stylex.props(styles.sectionBody)}>{children}</div>
        </AsyncContent>
      </div>
    </section>
  )
}

export function Closing({
  heading = 'What happens next',
  children,
  actions,
}: {
  heading?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <footer {...stylex.props(styles.closing)}>
      <Heading>{heading}</Heading>
      <Body>{children}</Body>
      {actions && <div {...stylex.props(styles.closingActions)}>{actions}</div>}
    </footer>
  )
}
