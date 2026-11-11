import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { useChartPointer } from '@/ui/chart-pointer'
import { chartStyles as styles } from '@/ui/chart-shared.stylex'
import { ChartSize } from '@/ui/chart-size'
import { ChartFloatTooltip } from '@/ui/chart-tooltip-float'
import { announceDatum, type Margin, type XYChartProps } from '@/ui/chart-types'

export function ChartFrame({
  data,
  series,
  xKey,
  formatX,
  formatValue,
  ariaLabel,
  margin,
  indexFromX,
  tooltipX,
  plot,
  legend,
}: XYChartProps & {
  formatValue: (value: number) => string
  margin: Margin
  indexFromX: (x: number, width: number) => number
  tooltipX: (index: number, width: number) => number
  plot: (size: { width: number; height: number }, activeIndex: number | null) => ReactNode
  legend?: ReactNode
}) {
  const pointer = useChartPointer({
    count: data.length,
    indexFromX,
    announce: (index) => announceDatum(data[index], { series, xKey, formatX, formatValue }),
  })
  const active = pointer.activeIndex

  return (
    <div
      {...pointer.rootProps}
      role="img"
      aria-label={ariaLabel}
      {...stylex.props(styles.container)}
    >
      <ChartSize>
        {({ width, height }) =>
          width > 0 && height > 0 ? (
            <>
              {plot({ width, height }, active)}
              <ChartFloatTooltip
                containerWidth={width}
                datum={active === null ? undefined : data[active]}
                formatValue={formatValue}
                formatX={formatX}
                series={series}
                x={active === null ? 0 : tooltipX(active, width)}
                xKey={xKey}
                y={margin.top}
              />
            </>
          ) : null
        }
      </ChartSize>
      {legend}
      <span aria-live="polite" {...stylex.props(styles.liveRegion)}>
        {pointer.announcement}
      </span>
    </div>
  )
}
