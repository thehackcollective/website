export type ChartDatum = Record<string, string | number>

export type SeriesRole =
  | 'primary'
  | 'compare'
  | 'series2'
  | 'series3'
  | 'series4'
  | 'series5'
  | 'series6'

export interface Series {
  key: string
  label: string
  role?: SeriesRole
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export const CHART_MARGIN: Margin = { top: 16, right: 8, bottom: 28, left: 36 }

const labelMaxFraction = 0.3

export function plotRight(margin: Margin, width: number): number {
  return Math.min(margin.right, Math.round(width * labelMaxFraction))
}

export interface XYChartProps {
  data: ChartDatum[]
  series: Series[]
  xKey: string
  formatValue?: (value: number) => string
  formatX?: ((datum: ChartDatum) => string) | undefined
  ariaLabel: string
}

export function roleOf(series: Series): SeriesRole {
  return series.role ?? 'primary'
}

export function cellValue(datum: ChartDatum | undefined, key: string): number {
  const value = datum?.[key]
  return typeof value === 'number' ? value : 0
}

function datumX(datum: ChartDatum | undefined, xKey: string): string {
  const raw = datum?.[xKey]
  return raw === undefined ? '' : String(raw)
}

export function datumLabel(
  datum: ChartDatum | undefined,
  xKey: string,
  formatX: ((datum: ChartDatum) => string) | undefined,
): string {
  if (datum !== undefined && formatX !== undefined) return formatX(datum)
  return datumX(datum, xKey)
}

export function announceDatum(
  datum: ChartDatum | undefined,
  {
    series,
    xKey,
    formatX,
    formatValue,
  }: Pick<XYChartProps, 'series' | 'xKey' | 'formatX'> & {
    formatValue: (value: number) => string
  },
): string {
  if (datum === undefined) return ''
  const parts = series.map((s) => `${s.label} ${formatValue(cellValue(datum, s.key))}`)
  return `${datumLabel(datum, xKey, formatX)}: ${parts.join(', ')}`
}
