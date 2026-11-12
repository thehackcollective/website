import * as stylex from '@stylexjs/stylex'
import { m, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { spring, stagger } from '@/lib/motion'
import { ChartXAxis, ChartYAxis } from '@/ui/chart-axes'
import { ChartCrosshair } from '@/ui/chart-crosshair'
import { monotoneAreaPath, monotoneLinePath } from '@/ui/chart-curve'
import { DirectLabels } from '@/ui/chart-direct-labels'
import { useValueScale } from '@/ui/chart-scales'
import { seriesStop, seriesStroke } from '@/ui/chart-series.stylex'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'
import {
  cellValue,
  datumLabel,
  type Margin,
  plotRight,
  roleOf,
  type XYChartProps,
} from '@/ui/chart-types'

export function XyPlot({
  width,
  height,
  data,
  series,
  xKey,
  fill,
  formatValue,
  formatX,
  margin,
  activeIndex,
}: Omit<XYChartProps, 'ariaLabel' | 'formatValue'> & {
  fill: 'area' | 'none'
  formatValue: (value: number) => string
  width: number
  height: number
  margin: Margin
  activeIndex: number | null
}) {
  const reduce = useReducedMotion()
  const gradientId = useId().replace(/:/g, '')
  const clipId = `${gradientId}-reveal`
  const innerWidth = Math.max(0, width - margin.left - plotRight(margin, width))
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)
  const [dimmedKey, setDimmedKey] = useState<string | null>(null)

  const xAt = (index: number) => (data.length <= 1 ? 0 : (index / (data.length - 1)) * innerWidth)

  const yScale = useValueScale(data, series, innerHeight)

  const last = data.at(-1)
  const activeDatum = activeIndex === null ? undefined : data[activeIndex]

  return (
    <svg {...stylex.props(styles.svg)} height={height} width={width} aria-hidden>
      <defs>
        {fill === 'area' &&
          series.flatMap((s) =>
            s.role === 'compare'
              ? []
              : [
                  <linearGradient
                    id={`${gradientId}-${s.key}`}
                    key={s.key}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" {...stylex.props(seriesStop[roleOf(s)])} stopOpacity={0.12} />
                    <stop offset="100%" {...stylex.props(seriesStop[roleOf(s)])} stopOpacity={0} />
                  </linearGradient>,
                ],
          )}
        {[0, 1].map((step) => (
          <clipPath id={`${clipId}-${step}`} key={step}>
            <m.rect
              {...stylex.props(styles.revealRect)}
              animate={{ scaleX: 1 }}
              height={innerHeight}
              initial={reduce ? false : { scaleX: 0 }}
              transition={{ ...spring.slow, delay: stagger(step) }}
              width={innerWidth}
              x={0}
              y={0}
            />
          </clipPath>
        ))}
      </defs>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <ChartYAxis format={formatValue} ticks={yScale.ticks} width={innerWidth} y={yScale.at} />
        {series.map((s) => {
          const points = data.map((d, i) => ({ x: xAt(i), y: yScale.at(cellValue(d, s.key)) }))
          return (
            <m.g
              animate={{ opacity: dimmedKey !== null && dimmedKey !== s.key ? 0.45 : 1 }}
              clipPath={`url(#${clipId}-${s.role === 'compare' ? 1 : 0})`}
              initial={false}
              key={s.key}
              transition={spring.fast}
            >
              {fill === 'area' && s.role !== 'compare' && (
                <path
                  d={monotoneAreaPath(points, innerHeight)}
                  fill={`url(#${gradientId}-${s.key})`}
                />
              )}
              <path
                {...stylex.props(seriesStroke[roleOf(s)])}
                d={monotoneLinePath(points)}
                fill="none"
                strokeDasharray={s.role === 'compare' ? '3 3' : undefined}
                strokeLinecap="round"
                strokeWidth={s.role === 'compare' ? 1.25 : 1.75}
              />
            </m.g>
          )
        })}
        <ChartXAxis
          count={data.length}
          label={(i) => datumLabel(data[i], xKey, formatX)}
          x={xAt}
          y={innerHeight + 18}
        />
        {activeIndex !== null && activeDatum !== undefined && (
          <ChartCrosshair
            height={innerHeight}
            points={series.map((s) => ({
              key: s.key,
              y: yScale.at(cellValue(activeDatum, s.key)),
              role: roleOf(s),
            }))}
            x={xAt(activeIndex)}
          />
        )}
        {series.length <= 3 && last !== undefined && (
          <DirectLabels
            labels={series.map((s) => ({
              seriesKey: s.key,
              x: xAt(data.length - 1) + 10,
              y: yScale.at(cellValue(last, s.key)),
              text: `${s.label} · ${formatValue(cellValue(last, s.key))}`,
              role: roleOf(s),
            }))}
            onHover={setDimmedKey}
          />
        )}
      </g>
    </svg>
  )
}
