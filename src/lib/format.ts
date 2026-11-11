type NumberFormat = 'number' | 'compact' | 'currency' | 'percent'

export interface FormatNumberOptions {
  format?: NumberFormat

  currency?: string
  locale?: string
  maximumFractionDigits?: number

  compact?: boolean
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(locale: string, options: Intl.NumberFormatOptions) {
  const key = locale + JSON.stringify(options)
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

function currencyOptions(currency: string): Intl.NumberFormatOptions {
  return {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'USD' ? 'narrowSymbol' : 'symbol',
  }
}

export function formatNumber(
  value: number,
  {
    format = 'number',
    currency = 'USD',
    locale = 'en-US',
    maximumFractionDigits,
    compact = false,
  }: FormatNumberOptions = {},
): string {
  if (!Number.isFinite(value)) return '—'

  let compactOptions: Intl.NumberFormatOptions = {}
  if (compact) {
    compactOptions =
      maximumFractionDigits === undefined
        ? { notation: 'compact', maximumSignificantDigits: 3 }
        : { notation: 'compact', maximumFractionDigits }
  }
  switch (format) {
    case 'compact':
      return getFormatter(locale, {
        notation: 'compact',
        maximumFractionDigits: maximumFractionDigits ?? 1,
      }).format(value)
    case 'currency':
      return getFormatter(locale, {
        ...currencyOptions(currency),
        maximumFractionDigits: maximumFractionDigits ?? 2,
        ...compactOptions,
      }).format(value)
    case 'percent':
      return getFormatter(locale, {
        style: 'percent',
        maximumFractionDigits: maximumFractionDigits ?? 1,
      }).format(value)
    default:
      return getFormatter(locale, {
        maximumFractionDigits: maximumFractionDigits ?? 0,
        ...compactOptions,
      }).format(value)
  }
}
