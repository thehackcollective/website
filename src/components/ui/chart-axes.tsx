import * as stylex from '@stylexjs/stylex'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'

const LABEL_W = 64
const LABEL_PAD = 8

function tickAnchor(index: number, count: number): 'start' | 'middle' | 'end' {
  if (index === 0) return 'start'
  if (index === count - 1) return 'end'
  return 'middle'
}

export function ChartXAxis({
  count,
  x,
  y,
  label,
}: {
  count: number
  x: (index: number) => number
  y: number
  label: (index: number) => string
}) {
  if (count === 0) return null
  const step = count <= 1 ? Number.POSITIVE_INFINITY : x(1) - x(0)
  const every = Math.max(1, Math.ceil(LABEL_W / Math.max(step, 1)))
  const firstX = x(0)
  const lastX = x(count - 1)
  const ticks = new Set<number>([0, count - 1])
  for (let i = 0; i < count; i += every) {
    const xi = x(i)
    if (xi - LABEL_W / 2 - (firstX + LABEL_W) < LABEL_PAD) continue
    if (lastX - LABEL_W - (xi + LABEL_W / 2) < LABEL_PAD) continue
    ticks.add(i)
  }
  return (
    <g>
      {[...ticks]
        .sort((a, b) => a - b)
        .map((i) => (
          <text
            {...stylex.props(styles.axisTick)}
            key={i}
            textAnchor={tickAnchor(i, count)}
            x={x(i)}
            y={y}
          >
            {label(i)}
          </text>
        ))}
    </g>
  )
}

export function ChartYAxis({
  ticks,
  y,
  width,
  format,
}: {
  ticks: number[]
  y: (value: number) => number
  width: number
  format: (value: number) => string
}) {
  const min = Math.min(...ticks)
  const max = Math.max(...ticks)
  return (
    <g>
      {ticks.map((tick) => (
        <line
          key={tick}
          {...stylex.props(styles.grid)}
          strokeWidth={1}
          x1={0}
          x2={width}
          y1={y(tick)}
          y2={y(tick)}
        />
      ))}
      {ticks.flatMap((tick) =>
        tick === min || tick === max
          ? [
              <text
                {...stylex.props(styles.axisTick)}
                key={`label-${tick}`}
                textAnchor="end"
                x={-8}
                y={y(tick) + 4}
              >
                {format(tick)}
              </text>,
            ]
          : [],
      )}
    </g>
  )
}
