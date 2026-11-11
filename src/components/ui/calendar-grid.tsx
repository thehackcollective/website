import * as stylex from '@stylexjs/stylex'
import { type KeyboardEvent, type ReactNode, useRef, useState, useSyncExternalStore } from 'react'
import { Button } from '@/ui/button'
import { calendarStyles as styles, toneStyles } from '@/ui/calendar-grid.stylex'
import {
  type CalendarView,
  clockOf,
  DAY_MS,
  dateOf,
  dayNumber,
  dayStartMs,
  HOUR_HEIGHT,
  hourLabel,
  layoutDay,
  longDay,
  minuteOfDay,
  monthOf,
  monthTitle,
  rangeLabel,
  shiftAnchor,
  timeRange,
  visibleDays,
  wallClockMs,
  weekdayLabel,
  weekStart,
} from '@/ui/calendar-model'
import { Icon } from '@/ui/icon'
import { IconButton } from '@/ui/icon-button'
import { icons } from '@/ui/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Segmented } from '@/ui/segmented'
import { SizeProvider } from '@/ui/size-provider'
import { type StatusTone, statusToneStyles } from '@/ui/status-dot.stylex'

export type CalendarEvent = {
  id: string
  start: number
  end: number
  title: string
  tone: StatusTone
  muted?: boolean
}

const calendarViews = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]
const gridHeight = 24 * HOUR_HEIGHT
const HOURS = Array.from({ length: 23 }, (_, index) => index + 1)
const minEventMinutes = 30
const MONTH_SHOWN = 3
const COMPACT_QUERY = '(max-width: 599px)'

const toPx = (minutes: number) => (minutes / 60) * HOUR_HEIGHT

const isView = (value: string): value is CalendarView =>
  value === 'day' || value === 'week' || value === 'month'

const subscribeCompact = (change: () => void) => {
  const query = window.matchMedia(COMPACT_QUERY)
  query.addEventListener('change', change)
  return () => query.removeEventListener('change', change)
}
const readCompact = () => window.matchMedia(COMPACT_QUERY).matches
const serverCompact = () => false

const subscribeMinute = (tick: () => void) => {
  const id = window.setInterval(tick, 30_000)
  return () => window.clearInterval(id)
}
const currentMinute = () => Math.floor(Date.now() / 60_000)

const toWallClock = (at: number, timeZone: string | undefined) => {
  if (timeZone !== undefined) return wallClockMs(at, timeZone)
  return at - new Date(at).getTimezoneOffset() * 60_000
}

type Segment = { event: CalendarEvent; start: number; end: number }

function segmentsOf(events: readonly CalendarEvent[], day: number): Segment[] {
  const from = dayStartMs(day)
  const to = from + DAY_MS
  return events
    .filter((event) => event.start < to && event.end > from)
    .map((event) => ({ event, start: Math.max(event.start, from), end: Math.min(event.end, to) }))
}

function isTyping(target: EventTarget) {
  return (
    target instanceof Element &&
    target.closest(
      'input, textarea, select, [role="radiogroup"], [role="group"], [contenteditable="true"]',
    ) !== null
  )
}

type Details = (event: CalendarEvent, close: () => void) => ReactNode

function EventPopover({
  event,
  openId,
  onOpen,
  details,
  label,
  look,
  children,
}: {
  event: CalendarEvent
  openId: string | null
  onOpen: (id: string | null) => void
  details: Details
  label?: string
  look: ReturnType<typeof stylex.props>
  children: ReactNode
}) {
  const open = openId === event.id
  return (
    <Popover open={open} onOpenChange={(next) => onOpen(next ? event.id : null)}>
      <PopoverTrigger render={<button type="button" aria-label={label} {...look} />}>
        {children}
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={8}>
        {details(event, () => onOpen(null))}
      </PopoverContent>
    </Popover>
  )
}

function TimeGrid({
  days,
  events,
  now,
  openId,
  onOpen,
  details,
}: {
  days: readonly number[]
  events: readonly CalendarEvent[]
  now: number
  openId: string | null
  onOpen: (id: string | null) => void
  details: Details
}) {
  const scrolled = useRef(false)
  const today = dayNumber(now)
  const nowMinutes = minuteOfDay(now)

  const scrollToDay = (node: HTMLDivElement | null) => {
    if (node === null || scrolled.current) return
    scrolled.current = true
    const focus = days.includes(today) ? Math.max(0, nowMinutes - 90) : 7 * 60
    node.scrollTop = toPx(focus)
  }

  const card = (segment: Segment, column: number, columns: number) => {
    const { event } = segment
    const start = minuteOfDay(segment.start)
    const height = Math.max(toPx(minEventMinutes), toPx((segment.end - segment.start) / 60_000) - 2)
    return (
      <EventPopover
        key={event.id}
        event={event}
        openId={openId}
        onOpen={onOpen}
        details={details}
        label={`${event.title}, ${timeRange(event.start, event.end)}`}
        look={stylex.props(
          styles.eventBox,
          toneStyles[event.tone],
          styles.event(toPx(start) + 1, height, column, columns),
          event.muted === true && styles.eventMuted,
          openId === event.id && styles.eventOpen,
        )}
      >
        <span
          {...stylex.props(
            styles.eventTitle,
            segment.end - segment.start < 45 * 60_000 && styles.eventTitleSingle,
          )}
        >
          {event.title}
        </span>
        {height >= toPx(30) && (
          <span {...stylex.props(styles.eventTime)}>{timeRange(event.start, event.end)}</span>
        )}
      </EventPopover>
    )
  }

  return (
    <>
      <div {...stylex.props(styles.head, styles.columns(days.length))}>
        <span />
        {days.map((day) => (
          <div key={day} {...stylex.props(styles.headCell)}>
            <span {...stylex.props(styles.weekday)}>{weekdayLabel(day)}</span>
            <span
              aria-current={day === today ? 'date' : undefined}
              {...stylex.props(styles.date, day === today && styles.today)}
            >
              {dateOf(day)}
            </span>
          </div>
        ))}
      </div>
      <div ref={scrollToDay} {...stylex.props(styles.scroller)}>
        <div {...stylex.props(styles.grid)}>
          <div aria-hidden {...stylex.props(styles.hours)}>
            {HOURS.map((hour) => (
              <span key={hour} {...stylex.props(styles.hourLabel(hour * HOUR_HEIGHT))}>
                {hourLabel(hour)}
              </span>
            ))}
          </div>
          <div {...stylex.props(styles.dayColumns(days.length))}>
            {days.map((day) => (
              <section
                key={day}
                aria-label={longDay(day)}
                {...stylex.props(styles.column(gridHeight))}
              >
                {HOURS.map((hour) => (
                  <span
                    key={hour}
                    aria-hidden
                    {...stylex.props(styles.hourLine(hour * HOUR_HEIGHT))}
                  />
                ))}
                {layoutDay(segmentsOf(events, day)).map(({ item, column, columns }) =>
                  card(item, column, columns),
                )}
                {day === today && (
                  <div {...stylex.props(styles.now(toPx(nowMinutes)))}>
                    <span {...stylex.props(styles.nowDot)} />
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function MonthView({
  days,
  anchor,
  events,
  today,
  openId,
  onOpen,
  onPick,
  details,
}: {
  days: readonly number[]
  anchor: number
  events: readonly CalendarEvent[]
  today: number
  openId: string | null
  onOpen: (id: string | null) => void
  onPick: (day: number) => void
  details: Details
}) {
  const month = monthOf(anchor)
  return (
    <>
      <div aria-hidden {...stylex.props(styles.monthHead)}>
        {days.slice(0, 7).map((day) => (
          <span key={day} {...stylex.props(styles.weekday)}>
            {weekdayLabel(day)}
          </span>
        ))}
      </div>
      <div {...stylex.props(styles.monthGrid)}>
        {days.map((day, index) => {
          const from = dayStartMs(day)
          const dayEvents = events
            .filter((event) => event.start >= from && event.start < from + DAY_MS)
            .sort((a, b) => a.start - b.start)
          const hidden = Math.max(0, dayEvents.length - MONTH_SHOWN)
          const outside = monthOf(day) !== month
          return (
            <div
              key={day}
              {...stylex.props(
                styles.monthCell,
                index % 7 === 6 && styles.monthCellLast,
                outside && styles.monthOutside,
              )}
            >
              <button
                type="button"
                aria-label={`Show ${longDay(day)}`}
                aria-current={day === today ? 'date' : undefined}
                onClick={() => onPick(day)}
                {...stylex.props(
                  styles.date,
                  styles.monthDate,
                  outside && styles.monthDateMuted,
                  day === today && styles.today,
                )}
              >
                {dateOf(day)}
              </button>
              {dayEvents.slice(0, MONTH_SHOWN).map((event) => (
                <EventPopover
                  key={event.id}
                  event={event}
                  openId={openId}
                  onOpen={onOpen}
                  details={details}
                  look={stylex.props(
                    styles.chip,
                    toneStyles[event.tone],
                    event.muted === true && styles.eventMuted,
                  )}
                >
                  <span aria-hidden {...stylex.props(styles.dot, statusToneStyles[event.tone])} />
                  <span {...stylex.props(styles.chipTime)}>{clockOf(event.start)}</span>
                  <span {...stylex.props(styles.chipTitle)}>{event.title}</span>
                </EventPopover>
              ))}
              {hidden > 0 && <span {...stylex.props(styles.more)}>+{hidden} more</span>}
            </div>
          )
        })}
      </div>
    </>
  )
}

function CalendarBody({
  view,
  days,
  anchor,
  events,
  now,
  openId,
  onOpen,
  onPick,
  details,
}: {
  view: CalendarView
  days: readonly number[]
  anchor: number
  events: readonly CalendarEvent[]
  now: number
  openId: string | null
  onOpen: (id: string | null) => void
  onPick: (day: number) => void
  details: Details
}) {
  if (view === 'month')
    return (
      <MonthView
        days={days}
        anchor={anchor}
        events={events}
        today={dayNumber(now)}
        openId={openId}
        onOpen={onOpen}
        onPick={onPick}
        details={details}
      />
    )
  return (
    <TimeGrid
      key={`${view}:${days[0]}`}
      days={days}
      events={events}
      now={now}
      openId={openId}
      onOpen={onOpen}
      details={details}
    />
  )
}

export function CalendarGrid({
  label,
  events,
  details,
  empty,
  timeZone,
}: {
  label: string
  events: readonly CalendarEvent[]
  details: Details
  empty?: ReactNode
  timeZone?: string | undefined
}) {
  const compact = useSyncExternalStore(subscribeCompact, readCompact, serverCompact)
  const now = toWallClock(
    useSyncExternalStore(subscribeMinute, currentMinute, currentMinute) * 60_000,
    timeZone,
  )
  const wallEvents = events.map((event) => ({
    ...event,
    start: toWallClock(event.start, timeZone),
    end: toWallClock(event.end, timeZone),
  }))
  const originals = new Map(events.map((event) => [event.id, event]))
  const wallDetails: Details = (event, close) =>
    details(originals.get(event.id) ?? event, close)
  const today = dayNumber(now)
  const [picked, setPicked] = useState<CalendarView | null>(null)
  const [anchor, setAnchor] = useState(today)
  const [openId, setOpenId] = useState<string | null>(null)
  const view: CalendarView = picked ?? (compact ? 'day' : 'week')
  const days = visibleDays(view, anchor, compact)
  const from = dayStartMs(days[0] ?? anchor)
  const to = dayStartMs((days[days.length - 1] ?? anchor) + 1)
  const shown = wallEvents.filter((event) => event.start < to && event.end > from)

  const goTo = (day: number, next: CalendarView = view) => {
    setOpenId(null)
    setAnchor(day)
    setPicked(next)
  }
  const step = (direction: 1 | -1) => goTo(shiftAnchor(view, anchor, direction, compact))

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
    if (isTyping(event.target)) return
    if (event.key === 'ArrowLeft') step(-1)
    else if (event.key === 'ArrowRight') step(1)
    else if (event.key === 't' || event.key === 'T') goTo(today)
    else return
    event.preventDefault()
  }

  const strip = weekStart(anchor)

  return (
    <section aria-label={label} onKeyDown={onKeyDown} {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.toolbar)}>
        <div {...stylex.props(styles.heading)}>
          <h2 {...stylex.props(styles.month)}>{monthTitle(anchor)}</h2>
          <p aria-live="polite" {...stylex.props(styles.range)}>
            {rangeLabel(view, days, anchor)}
          </p>
        </div>
        <SizeProvider size="compact">
          <div {...stylex.props(styles.controls)}>
            <Button size="sm" variant="secondary" aria-keyshortcuts="T" onClick={() => goTo(today)}>
              Today
            </Button>
            <div {...stylex.props(styles.stepper)}>
              <IconButton
                label="Previous"
                icon={<Icon icon={icons.back} />}
                onClick={() => step(-1)}
              />
              <IconButton
                label="Next"
                icon={<Icon icon={icons.forward} />}
                onClick={() => step(1)}
              />
            </div>
            <Segmented
              aria-label="Calendar view"
              value={view}
              options={calendarViews}
              onChange={(next) => {
                if (isView(next)) goTo(anchor, next)
              }}
            />
          </div>
        </SizeProvider>
      </div>
      {view === 'day' && (
        <div {...stylex.props(styles.strip)}>
          <SizeProvider size="compact">
            <Segmented
              aria-label="Day"
              fill
              value={String(anchor)}
              options={Array.from({ length: 7 }, (_, index) => strip + index).map((day) => ({
                value: String(day),
                label: String(dateOf(day)),
              }))}
              onChange={(next) => goTo(Number(next))}
            />
          </SizeProvider>
        </div>
      )}
      {shown.length === 0 && empty !== undefined ? (
        <div {...stylex.props(styles.empty)}>{empty}</div>
      ) : (
        <CalendarBody
          view={view}
          days={days}
          anchor={anchor}
          events={view === 'month' ? wallEvents : shown}
          now={now}
          openId={openId}
          onOpen={setOpenId}
          onPick={(day) => goTo(day, 'day')}
          details={wallDetails}
        />
      )}
    </section>
  )
}
