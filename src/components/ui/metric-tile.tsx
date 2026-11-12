import * as stylex from '@stylexjs/stylex'
import { lazy, type ReactNode, Suspense } from 'react'
import { breakpoint, card, color, layout, radius, space, text } from '@/tokens/token-consts.stylex'
import { type Tone, toneColor } from '@/ui/tone.stylex'
import { hasTrend } from '@/ui/trend-points'

const AreaSparkline = lazy(() =>
  import('@/ui/area-sparkline').then((module) => ({ default: module.AreaSparkline })),
)

export type MetricState =
  | {
      kind: 'value'
      display: string
      series?: readonly (number | null)[]
      delta?: string
      note?: string
    }
  | { kind: 'unavailable'; reason: string }

export interface MetricSpec {
  label: string
  state: MetricState
}

const styles = stylex.create({
  grid: {
    display: 'grid',
    gap: { default: space.sm, [breakpoint.tablet]: space.md },
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      [breakpoint.tablet]: 'repeat(4, minmax(0, 1fr))',
    },
    margin: 0,
    minWidth: 0,
  },
  tile: {
    backgroundColor: card.background,
    borderColor: color.borderDefault,
    borderRadius: card.radius,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: space['2xs'],
    minWidth: 0,
    padding: space.md,
  },
  label: {
    alignItems: 'center',
    color: color.textSubtle,
    columnGap: space.xs,
    display: 'flex',
    fontSize: text.sizeCaption,
    letterSpacing: text.trackingCaption,
    lineHeight: text.leadingCaption,
    margin: 0,
    minWidth: 0,
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dot: {
    backgroundColor: 'currentColor',
    borderRadius: radius.full,
    flexShrink: 0,
    height: '8px',
    width: '8px',
  },
  value: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pending: {
    color: color.textSubtlest,
  },
  tiles: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  spark: {
    boxSizing: 'content-box',
    height: layout.sparklineHeight,
    margin: 0,
    paddingBlockStart: space.xs,
  },
  delta: {
    color: color.textDefault,
    fontVariantNumeric: 'tabular-nums',
  },
  note: {
    alignItems: 'center',
    color: color.textSubtle,
    columnGap: space.xs,
    display: 'flex',
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    margin: 0,
    minHeight: layout.noteMinHeight,
  },
})

export function MetricTileGrid({ children }: { children: ReactNode }) {
  return <dl {...stylex.props(styles.grid)}>{children}</dl>
}

function trendSeries(state: MetricState) {
  if (state.kind !== 'value' || state.series === undefined) return undefined
  return hasTrend(state.series) ? state.series : undefined
}

function tileNote(state: MetricState): string | undefined {
  if (state.kind === 'unavailable') return state.reason
  return state.series !== undefined && trendSeries(state) === undefined
    ? 'Building history. A trend line appears after a few days.'
    : state.note
}

function repeatedNote(tiles: readonly MetricSpec[]): string | null {
  const notes = tiles.map(({ state }) => tileNote(state))
  return (
    notes.find((note, index) => note !== undefined && notes.indexOf(note, index + 1) !== -1) ?? null
  )
}

function Pending({ note }: { note: ReactNode }) {
  return (
    <>
      <dd {...stylex.props(styles.value, styles.pending)}>—</dd>
      <dd {...stylex.props(styles.spark)} />
      <dd {...stylex.props(styles.note)}>{note}</dd>
    </>
  )
}

function Trend({
  label,
  series,
  tone,
}: {
  label: string
  series: readonly (number | null)[]
  tone: Tone
}) {
  return (
    <Suspense fallback={null}>
      <AreaSparkline data={series} tone={tone} label={`${label} trend`} />
    </Suspense>
  )
}

function Body({
  label,
  state,
  tone,
  hiddenNote,
}: MetricSpec & { tone: Tone; hiddenNote: string | null }) {
  const note = tileNote(state)
  const shown = note === hiddenNote ? undefined : note
  if (state.kind === 'unavailable') return <Pending note={shown} />
  const series = trendSeries(state)
  return (
    <>
      <dd data-slot="metric-value" {...stylex.props(styles.value)}>
        {state.display}
      </dd>
      <dd {...stylex.props(styles.spark)}>
        {series !== undefined && <Trend label={label} series={series} tone={tone} />}
      </dd>
      <dd {...stylex.props(styles.note)}>
        {state.delta !== undefined && <span {...stylex.props(styles.delta)}>{state.delta}</span>}
        {shown}
      </dd>
    </>
  )
}

export function MetricTile({
  label,
  state,
  tone,
  hiddenNote = null,
}: MetricSpec & { tone: Tone; hiddenNote?: string | null }) {
  return (
    <div data-slot="metric-tile" data-state={state.kind} {...stylex.props(styles.tile)}>
      <dt {...stylex.props(styles.label)}>
        <span aria-hidden="true" {...stylex.props(styles.dot, toneColor[tone])} />
        <span {...stylex.props(styles.labelText)}>{label}</span>
      </dt>
      <Body label={label} state={state} tone={tone} hiddenNote={hiddenNote} />
    </div>
  )
}

export function MetricTiles({
  tiles,
}: {
  tiles: readonly (MetricSpec & { id: string; tone: Tone })[]
}) {
  if (tiles.length === 0) return null
  const note = repeatedNote(tiles)
  return (
    <div {...stylex.props(styles.tiles)}>
      <MetricTileGrid>
        {tiles.map(({ id, ...tile }) => (
          <MetricTile key={id} {...tile} hiddenNote={note} />
        ))}
      </MetricTileGrid>
      {note !== null && <p {...stylex.props(styles.note)}>{note}</p>}
    </div>
  )
}
