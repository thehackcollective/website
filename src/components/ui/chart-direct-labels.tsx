import * as stylex from '@stylexjs/stylex'
import { seriesFill } from '@/ui/chart-series.stylex'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'
import type { SeriesRole } from '@/ui/chart-types'

interface DirectLabel {
  seriesKey: string
  x: number
  y: number
  text: string
  role: SeriesRole
}

export function DirectLabels({
  labels,
  onHover,
}: {
  labels: DirectLabel[]
  onHover: (seriesKey: string | null) => void
}) {
  return (
    <g>
      {labels.map((label) => (
        <text
          {...stylex.props(
            styles.directLabel,
            seriesFill[label.role],
            label.role === 'compare' && styles.directLabelMuted,
          )}
          key={label.seriesKey}
          onPointerEnter={() => onHover(label.seriesKey)}
          onPointerLeave={() => onHover(null)}
          x={label.x}
          y={label.y + 4}
        >
          {label.text}
        </text>
      ))}
    </g>
  )
}
