import * as stylex from '@stylexjs/stylex'
import { scaleBand } from 'd3-scale'
import { m, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { formatNumber } from '@/lib/format'
import { spring, stagger } from '@/lib/motion'
import { ChartXAxis, ChartYAxis } from '@/ui/chart-axes'
import { ChartFrame } from '@/ui/chart-frame'
import { useValueScale } from '@/ui/chart-scales'
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

const bandPaddingInner = 0.3
const bandPaddingOuter = 0.15
const seriesPaddingInner = 0.15

function bandScale(data: ChartDatum[], innerWidth: number) {
  return scaleBand<number>()
    .domain(data.map((_, i) => i))
    .range([0, innerWidth])
    .paddingInner(bandPaddingInner)
    .paddingOuter(bandPaddingOuter)
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
  const xBand = useMemo(() => bandScale(data, innerWidth), [data, innerWidth])
  const xInner = useMemo(
    () =>
      scaleBand<string>()
        .domain(series.map((s) => s.key))
        .range([0, xBand.bandwidth()])
        .paddingInner(seriesPaddingInner),
    [series, xBand],
  )

  return (
    <svg {...stylex.props(styles.svg)} height={height} width={width} aria-hidden>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <ChartYAxis format={formatValue} ticks={yScale.ticks(4)} width={innerWidth} y={yScale} />
        {data.map((datum, index) =>
          series.map((s) => {
            const value = cellValue(datum, s.key)
            return (
              <m.rect
                {...stylex.props(styles.bar, seriesFill[roleOf(s)])}
                animate={{
                  scaleY: 1,
                  opacity: activeIndex !== null && activeIndex !== index ? 0.45 : 1,
                }}
                height={innerHeight - yScale(value)}
                initial={reduce ? false : { scaleY: 0 }}
                key={`${datumLabel(datum, xKey, undefined)}-${s.key}`}
                rx={4}
                transition={reduce ? spring.fast : { ...spring.slow, delay: stagger(index) }}
                width={xInner.bandwidth()}
                x={(xBand(index) ?? 0) + (xInner(s.key) ?? 0)}
                y={yScale(value)}
              />
            )
          }),
        )}
        <ChartXAxis
          count={data.length}
          label={(i) => datumLabel(data[i], xKey, formatX)}
          x={(i) => (xBand(i) ?? 0) + xBand.bandwidth() / 2}
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
        const xBand = bandScale(data, innerWidthOf(width))
        return margin.left + (xBand(index) ?? 0) + xBand.bandwidth() / 2
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
