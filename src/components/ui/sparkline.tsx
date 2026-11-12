import * as stylex from '@stylexjs/stylex'
import { lineDrawStyles } from '@/ui/line-draw.stylex'
import { toneColor } from '@/ui/tone.stylex'
import { trendSummary } from '@/ui/trend-points'

const WIDTH = 80
const HEIGHT = 24
const INSET = 2

const styles = stylex.create({
  root: { display: 'block', flexShrink: 0, overflow: 'visible' },
})

function pointY(value: number, min: number, range: number) {
  if (range === 0) return HEIGHT / 2
  return HEIGHT - INSET - ((value - min) / range) * (HEIGHT - 2 * INSET)
}

function points(values: readonly number[]) {
  const min = Math.min(...values)
  const range = Math.max(...values) - min
  const step = WIDTH / (values.length - 1)
  return values.map((value, index) => ({
    x: (index * step).toFixed(1),
    y: pointY(value, min, range).toFixed(1),
  }))
}

export function Sparkline({ values, label }: { values: readonly number[]; label: string }) {
  if (values.length < 2) return null
  const line = points(values)
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ')
  return (
    <svg
      role="img"
      aria-label={trendSummary(label, values)}
      data-slot="sparkline"
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      {...stylex.props(styles.root, toneColor.ink)}
    >
      <path d={line} pathLength={1} stroke="currentColor" {...stylex.props(lineDrawStyles.line)} />
    </svg>
  )
}
