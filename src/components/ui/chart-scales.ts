import { scaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { type ChartDatum, cellValue, type Series } from '@/ui/chart-types'

export function useValueScale(data: ChartDatum[], series: Series[], innerHeight: number) {
  return useMemo(() => {
    const peaks = data
      .map((d) => Math.max(...series.map((s) => cellValue(d, s.key))))
      .filter((value) => !Number.isNaN(value))
    const peak = peaks.length === 0 ? 0 : Math.max(...peaks)
    return scaleLinear().domain([0, peak]).range([innerHeight, 0]).nice()
  }, [data, series, innerHeight])
}
