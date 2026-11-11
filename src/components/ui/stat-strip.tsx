import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import { m } from 'motion/react'
import { Children, type ReactNode, useState } from 'react'
import { exitTween, spring } from '@/lib/motion'
import { Icon } from '@/ui/icon'
import { Sparkline } from '@/ui/sparkline'
import { statStripStyles as styles } from '@/ui/stat-strip.stylex'
import { hasTrend } from '@/ui/trend-points'

export function StatStrip({ children }: { children: ReactNode }) {
  const three = Children.toArray(children).length === 3
  return <dl {...stylex.props(styles.strip, three && styles.stripThree)}>{children}</dl>
}

const toneForDetail = {
  neutral: null,
  positive: styles.detailPositive,
  negative: styles.detailNegative,
} as const

export function Stat({
  label,
  value,
  detail,
  tone = 'neutral',
  icon,
  trend,
  children,
}: {
  label: string
  value: string
  detail?: string
  tone?: 'neutral' | 'positive' | 'negative'
  icon?: IconSvgElement
  trend?: readonly number[]
  children?: ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      {...stylex.props(styles.stat)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <m.span
        aria-hidden
        {...stylex.props(styles.hoverWash)}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={hovered ? spring.fast : exitTween.fast}
      />
      <dt {...stylex.props(styles.label)}>
        {icon !== undefined && <Icon icon={icon} size="sm" />}
        {label}
      </dt>
      <dd {...stylex.props(styles.value)}>{value}</dd>
      {detail && <dd {...stylex.props(styles.detail, toneForDetail[tone])}>{detail}</dd>}
      {children !== undefined && <dd {...stylex.props(styles.detail)}>{children}</dd>}
      {trend && hasTrend(trend) && (
        <dd {...stylex.props(styles.trend, hovered && styles.trendShown)}>
          <Sparkline values={trend} label={`${label} trend`} />
        </dd>
      )}
    </div>
  )
}
