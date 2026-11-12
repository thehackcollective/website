import { formatNumber } from '@/lib/format'

export function knownPoints(data: readonly (number | null)[]) {
  return data.filter((value) => value !== null)
}

export function hasTrend(data: readonly (number | null)[]) {
  return knownPoints(data).length >= 2
}

export function trendSummary(label: string, values: readonly number[]) {
  return `${label}: ${formatNumber(values[0] ?? 0)} to ${formatNumber(values.at(-1) ?? 0)}`
}
