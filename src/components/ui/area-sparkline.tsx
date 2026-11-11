import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { type Tone, toneColor } from '@/ui/tone.stylex'
import { knownPoints, trendSummary } from '@/ui/trend-points'

const MARGIN = { top: 2, right: 0, bottom: 0, left: 0 } as const

const styles = stylex.create({
  root: {
    height: '100%',
    width: '100%',
  },
})

export function AreaSparkline({
  data,
  tone,
  label,
}: {
  data: readonly (number | null)[]
  tone: Tone
  label: string
}) {
  const id = `spark${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const points = React.useMemo(() => data.map((y, i) => ({ i, y })), [data])
  const values = knownPoints(data)
  if (values.length < 2) return null
  return (
    <div
      data-slot="area-sparkline"
      role="img"
      aria-label={trendSummary(label, values)}
      {...stylex.props(styles.root, toneColor[tone])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={MARGIN}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="y"
            stroke="currentColor"
            strokeWidth={1.5}
            fill={`url(#${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
