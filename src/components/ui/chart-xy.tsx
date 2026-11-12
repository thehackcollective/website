import { useMemo } from 'react'
import { formatNumber } from '@/lib/format'
import { ChartFrame } from '@/ui/chart-frame'
import { SeriesLegend } from '@/ui/chart-legend-series'
import {
  CHART_MARGIN,
  cellValue,
  type Margin,
  plotRight,
  type XYChartProps,
} from '@/ui/chart-types'
import { XyPlot } from '@/ui/chart-xy-plot'

const labelGap = 10
const labelCharRatio = 0.55
const labelFontPx = 12

function labelMargin({
  data,
  series,
  formatValue,
}: Pick<XYChartProps, 'data' | 'series'> & {
  formatValue: (value: number) => string
}): Margin {
  const last = data.at(-1)
  if (series.length > 3 || last === undefined) return CHART_MARGIN
  const widest = Math.max(
    ...series.map(
      (s) =>
        `${s.label} · ${formatValue(cellValue(last, s.key))}`.length * labelFontPx * labelCharRatio,
    ),
  )
  return { ...CHART_MARGIN, right: Math.ceil(widest) + labelGap }
}

function XyChart({
  fill,
  formatValue = formatNumber,
  ...props
}: XYChartProps & { fill: 'area' | 'none' }) {
  const { data, series } = props
  const margin = useMemo(
    () => labelMargin({ data, series, formatValue }),
    [data, series, formatValue],
  )
  const innerWidth = (width: number) => Math.max(width - margin.left - plotRight(margin, width), 1)
  const xAt = (index: number, width: number) =>
    data.length <= 1 ? 0 : (index / (data.length - 1)) * innerWidth(width)

  return (
    <ChartFrame
      {...props}
      formatValue={formatValue}
      margin={margin}
      indexFromX={(px, width) =>
        Math.round(((px - margin.left) / innerWidth(width)) * (data.length - 1))
      }
      tooltipX={(index, width) => margin.left + xAt(index, width)}
      legend={series.length > 3 ? <SeriesLegend series={series} /> : null}
      plot={({ width, height }, activeIndex) => (
        <XyPlot
          {...props}
          activeIndex={activeIndex}
          fill={fill}
          formatValue={formatValue}
          height={height}
          margin={margin}
          width={width}
        />
      )}
    />
  )
}

export function LineChart(props: XYChartProps) {
  return <XyChart {...props} fill="none" />
}

export function AreaChart(props: XYChartProps) {
  return <XyChart {...props} fill="area" />
}
