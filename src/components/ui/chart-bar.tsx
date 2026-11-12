import * as stylex from '@stylexjs/stylex'
import { m, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { formatNumber } from '@/lib/format'
import { spring, stagger } from '@/lib/motion'
import { ChartXAxis, ChartYAxis } from '@/ui/chart-axes'
import { ChartFrame } from '@/ui/chart-frame'
import { bandScale, useValueScale } from '@/ui/chart-scales'
import { seriesFill } from '@/ui/chart-series.stylex'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'
import {
  CHART_MARGIN,
  type ChartDatum,
  cellValue,
  datumLabel,
  roleOf,
  type XYChartProps,
} from '@/ui/chart-types'

const groupPadding = { inner: 0.3, outer: 0.15 } as const
const seriesPadding = { inner: 0.15, outer: 0 } as const

function groupBands(data: ChartDatum[], innerWidth: number) {
  return bandScale(data.length, innerWidth, groupPadding)
}

function innerWidthOf(width: number) {
  return Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right)
}

function Bars({
  width,
  height,
  data,
  series,
  xKey,
  formatX,
  formatValue,
  activeIndex,
}: Omit<XYChartProps, 'ariaLabel' | 'formatValue'> & {
  width: number
  height: number
  formatValue: (value: number) => string
  activeIndex: number | null
}) {
  const reduce = useReducedMotion()
  const margin = CHART_MARGIN
  const innerWidth = innerWidthOf(width)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)
  const yScale = useValueScale(data, series, innerHeight)
  const xBand = useMemo(() => groupBands(data, innerWidth), [data, innerWidth])
  const xInner = useMemo(
    () => bandScale(series.length, xBand.bandwidth, seriesPadding),
    [series.length, xBand],
  )

  return (
    <svg {...stylex.props(styles.svg)} height={height} width={width} aria-hidden>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <ChartYAxis format={formatValue} ticks={yScale.ticks} width={innerWidth} y={yScale.at} />
        {data.map((datum, index) =>
          series.map((s, seriesIndex) => {
            const value = cellValue(datum, s.key)
            return (
              <m.rect
                {...stylex.props(styles.bar, seriesFill[roleOf(s)])}
                animate={{
                  scaleY: 1,
                  opacity: activeIndex !== null && activeIndex !== index ? 0.45 : 1,
                }}
                height={innerHeight - yScale.at(value)}
                initial={reduce ? false : { scaleY: 0 }}
                key={`${datumLabel(datum, xKey, undefined)}-${s.key}`}
                rx={4}
                transition={reduce ? spring.fast : { ...spring.slow, delay: stagger(index) }}
                width={xInner.bandwidth}
                x={xBand.start(index) + xInner.start(seriesIndex)}
                y={yScale.at(value)}
              />
            )
          }),
        )}
        <ChartXAxis
          count={data.length}
          label={(i) => datumLabel(data[i], xKey, formatX)}
          x={(i) => xBand.start(i) + xBand.bandwidth / 2}
          y={innerHeight + 18}
        />
      </g>
    </svg>
  )
}

export function BarChart({ formatValue = formatNumber, ...props }: XYChartProps) {
  const { data } = props
  const margin = CHART_MARGIN

  return (
    <ChartFrame
      {...props}
      formatValue={formatValue}
      margin={margin}
      indexFromX={(px, width) =>
        Math.floor(((px - margin.left) / Math.max(innerWidthOf(width), 1)) * data.length)
      }
      tooltipX={(index, width) => {
        const xBand = groupBands(data, innerWidthOf(width))
        return margin.left + xBand.start(index) + xBand.bandwidth / 2
      }}
      plot={({ width, height }, activeIndex) => (
        <Bars
          {...props}
          activeIndex={activeIndex}
          formatValue={formatValue}
          height={height}
          width={width}
        />
      )}
    />
  )
}
