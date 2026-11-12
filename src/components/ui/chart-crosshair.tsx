import * as stylex from '@stylexjs/stylex'
import { m, useReducedMotion } from 'motion/react'
import { exitTween, spring } from '@/lib/motion'
import { seriesStroke } from '@/ui/chart-series.stylex'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'
import type { SeriesRole } from '@/ui/chart-types'

export function ChartCrosshair({
  x,
  height,
  points,
}: {
  x: number
  height: number
  points: Array<{ key: string; y: number; role: SeriesRole }>
}) {
  const reduce = useReducedMotion()
  return (
    <m.g animate={{ x }} initial={false} transition={reduce ? exitTween.fast : spring.moderate}>
      <line {...stylex.props(styles.crosshair)} strokeWidth={1} x1={0} x2={0} y1={0} y2={height} />
      {points.map((point) => (
        <circle
          {...stylex.props(styles.crosshairDot, seriesStroke[point.role])}
          cx={0}
          cy={point.y}
          key={point.key}
          r={3.5}
          strokeWidth={2}
        />
      ))}
    </m.g>
  )
}
