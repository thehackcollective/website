export type CalendarView = 'day' | 'week' | 'month'

export const DAY_MS = 86_400_000
export const HOUR_HEIGHT = 48
const COMPACT_DAYS = 3
const MINUTE_MS = 60_000

const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
const longDayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const shortDayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const clockFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
})
const hourFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: 'UTC' })

const dateOfDay = (day: number) => new Date(day * DAY_MS)

export const dayNumber = (ms: number) => Math.floor(ms / DAY_MS)
export const dayStartMs = (day: number) => day * DAY_MS
export const minuteOfDay = (ms: number) => (((ms % DAY_MS) + DAY_MS) % DAY_MS) / MINUTE_MS
const weekdayOf = (day: number) => dateOfDay(day).getUTCDay()
export const dateOf = (day: number) => dateOfDay(day).getUTCDate()
export const monthOf = (day: number) => dateOfDay(day).getUTCMonth()
const yearOf = (day: number) => dateOfDay(day).getUTCFullYear()
export const weekdayLabel = (day: number) => weekdayFormat.format(dateOfDay(day))
export const longDay = (day: number) => longDayFormat.format(dateOfDay(day))
const shortDay = (day: number) => shortDayFormat.format(dateOfDay(day))
export const monthTitle = (day: number) => monthFormat.format(dateOfDay(day))
export const hourLabel = (hour: number) => hourFormat.format(hour * 3_600_000)
export const clockOf = (ms: number) => clockFormat.format(ms)

export const weekStart = (day: number) => day - ((weekdayOf(day) + 6) % 7)
const monthStart = (day: number) => day - dateOf(day) + 1

const WALL_CLOCKS = new Map<string, Intl.DateTimeFormat>()

function wallClock(timeZone: string): Intl.DateTimeFormat {
  const cached = WALL_CLOCKS.get(timeZone)
  if (cached !== undefined) return cached
  const created = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
  WALL_CLOCKS.set(timeZone, created)
  return created
}

export function wallClockMs(instant: number, timeZone: string): number {
  const parts = wallClock(timeZone).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((entry) => entry.type === type)?.value ?? 0)
  return Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
  )
}

function weekNumber(day: number) {
  const thursday = weekStart(day) + 3
  const yearStart = dayNumber(Date.UTC(yearOf(thursday), 0, 1))
  return Math.floor((thursday - yearStart) / 7) + 1
}

export function visibleDays(view: CalendarView, anchor: number, compact: boolean): number[] {
  if (view === 'day') return [anchor]
  if (view === 'week') {
    const first = compact ? anchor : weekStart(anchor)
    return Array.from({ length: compact ? COMPACT_DAYS : 7 }, (_, index) => first + index)
  }
  const first = weekStart(monthStart(anchor))
  return Array.from({ length: 42 }, (_, index) => first + index)
}

export function shiftAnchor(view: CalendarView, anchor: number, step: 1 | -1, compact: boolean) {
  if (view === 'day') return anchor + step
  if (view === 'week') return anchor + step * (compact ? COMPACT_DAYS : 7)
  return dayNumber(Date.UTC(yearOf(anchor), monthOf(anchor) + step, 1))
}

export function rangeLabel(view: CalendarView, days: readonly number[], anchor: number) {
  const first = days[0] ?? anchor
  const last = days[days.length - 1] ?? anchor
  if (view === 'day') return `Week ${weekNumber(anchor)} · ${longDay(anchor)}`
  if (view === 'week') return `Week ${weekNumber(first)} · ${shortDay(first)} – ${shortDay(last)}`
  const end = shiftAnchor('month', anchor, 1, false) - 1
  return `${shortDay(monthStart(anchor))} – ${shortDay(end)}`
}

export const timeRange = (start: number, end: number) => `${clockOf(start)} – ${clockOf(end)}`

export function durationLabel(ms: number) {
  const minutes = Math.round(ms / MINUTE_MS)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

type Positioned<T> = { item: T; column: number; columns: number }

export function layoutDay<T extends { start: number; end: number }>(
  items: readonly T[],
): Positioned<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end)
  const out: Positioned<T>[] = []
  let cluster: { item: T; column: number }[] = []
  let clusterEnd = Number.NEGATIVE_INFINITY
  let columnEnds: number[] = []
  const flush = () => {
    for (const entry of cluster) out.push({ ...entry, columns: columnEnds.length })
    cluster = []
    columnEnds = []
  }
  for (const item of sorted) {
    if (item.start >= clusterEnd && cluster.length > 0) flush()
    let column = columnEnds.findIndex((end) => end <= item.start)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(item.end)
    } else {
      columnEnds[column] = item.end
    }
    cluster.push({ item, column })
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  if (cluster.length > 0) flush()
  return out
}
