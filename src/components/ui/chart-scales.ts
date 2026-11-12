import { useMemo } from 'react'
import { type ChartDatum, cellValue, type Series } from '@/ui/chart-types'

const domainSteps = 10
const tickSteps = 4

function tickStep(span: number, count: number): number {
  const raw = span / count
  const power = 10 ** Math.floor(Math.log10(raw))
  const error = raw / power
  if (error >= Math.sqrt(50)) return 10 * power
  if (error >= Math.sqrt(10)) return 5 * power
  if (error >= Math.sqrt(2)) return 2 * power
  return power
}

function niceDomain(peak: number): { top: number; ticks: number[] } {
  if (peak <= 0) return { top: 0, ticks: [0] }
  const fine = tickStep(peak, domainSteps)
  const top = Math.ceil(peak / fine) * fine
  const coarse = tickStep(top, tickSteps)
  const count = Math.floor(top / coarse + 1e-9)
  const ticks = Array.from({ length: count + 1 }, (_, i) => Number((i * coarse).toPrecision(12)))
  return { top, ticks }
}

export interface ValueScale {
  at: (value: number) => number
  ticks: number[]
}

export function useValueScale(
  data: ChartDatum[],
  series: Series[],
  innerHeight: number,
): ValueScale {
  return useMemo(() => {
    const peaks = data
      .map((d) => Math.max(...series.map((s) => cellValue(d, s.key))))
      .filter((value) => !Number.isNaN(value))
    const peak = peaks.length === 0 ? 0 : Math.max(...peaks)
    const { top, ticks } = niceDomain(peak)
    const at = (value: number) => (top > 0 ? innerHeight * (1 - value / top) : innerHeight)
    return { at, ticks }
  }, [data, series, innerHeight])
}

export interface BandScale {
  start: (index: number) => number
  bandwidth: number
}

export function bandScale(
  count: number,
  extent: number,
  { inner, outer }: { inner: number; outer: number },
): BandScale {
  const step = extent / Math.max(1, count - inner + outer * 2)
  const offset = (extent - step * (count - inner)) / 2
  return { start: (index) => offset + index * step, bandwidth: step * (1 - inner) }
}
