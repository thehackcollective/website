import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import {
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import { isStringArray } from '@/lib/guards'
import { playSound } from '@/lib/interaction-sounds'
import { cssEasing } from '@/lib/motion'
import { readStored, writeStored } from '@/lib/stored'
import { useMountEffect } from '@/lib/use-mount-effect'
import { color, motion } from '@/tokens/token-consts.stylex'
import { Button } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'
import { dynamicTableStyles, tableStyles as styles, tableVars } from '@/ui/table.stylex'
import { Dot, type Tone } from '@/ui/table-cells'
import { useTableSelection } from '@/ui/use-table-selection'
import { useVirtualRows, VIRTUAL_ROWS_FROM } from '@/ui/virtual-rows'
import { virtualRowsStyles as virtualStyles } from '@/ui/virtual-rows.stylex'

export type Dock = 'lead' | 'trail' | 'none'

export interface TableColumn<Row> {
  id: string
  label: string
  icon?: IconSvgElement
  width?: number
  tier?: number
  dock?: Dock
  align?: 'start' | 'end'
  render: (row: Row) => ReactNode
  renderDocked?: (row: Row) => ReactNode
  sortValue?: (row: Row) => string | number
}

export interface TableGroup {
  id: string
  label: string
  mark: ReactNode
  description?: string
}

export interface TableConfig<Row> {
  id?: string
  title?: string
  icon?: IconSvgElement
  rows: readonly Row[]
  rowId: (row: Row) => string
  mark: (row: Row) => ReactNode
  label: (row: Row) => ReactNode
  leadSortValue?: (row: Row) => string | number
  searchText: (row: Row) => string
  columns: readonly TableColumn<Row>[]
  compact?: boolean
  showHeader?: boolean
  groups?: {
    list: readonly TableGroup[]
    of: (row: Row) => string
    fold?: boolean
    wrap?: boolean
  }
  search?: string
  searchPlaceholder?: string
  ariaLabel?: string
  chips?: {
    valueOf: (row: Row) => string
    options: readonly { value: string; label: string; tone: Tone }[]
  }
  defaultSort?: { column: string; dir: 1 | -1 }
  pageSize?: number
}

export interface TableTuning {
  zone: number
  strain: number
  give: number
  curve: number
  follow: number
  snap: number
  stagger: number
  ease: string
  fade: number
  smear: number
  hysteresis: number
  iconOffset: number
  slow: number
  reduced: 'auto' | 'on'
  relax: boolean
  sound: number
}

const DEFAULT_TABLE_TUNING: TableTuning = {
  zone: 56,
  strain: 12,
  give: 3,
  curve: 2,
  follow: 90,
  snap: 140,
  stagger: 16,
  ease: motion.ease,
  fade: 0.35,
  smear: 6,
  hysteresis: 0,
  iconOffset: 8,
  slow: 1,
  reduced: 'auto',
  relax: true,
  sound: 1,
}

type Item<Row> =
  | { kind: 'group'; group: TableGroup; size: number }
  | { kind: 'row'; row: Row; id: string }

const STRAIN_VARS = [
  tableVars.s0,
  tableVars.s1,
  tableVars.s2,
  tableVars.s3,
  tableVars.s4,
  tableVars.s5,
  tableVars.s6,
  tableVars.s7,
  tableVars.s8,
]

function tuningOf(partial: Partial<TableTuning> | undefined): TableTuning {
  const values = partial ?? {}
  return {
    zone: values.zone ?? DEFAULT_TABLE_TUNING.zone,
    strain: values.strain ?? DEFAULT_TABLE_TUNING.strain,
    give: values.give ?? DEFAULT_TABLE_TUNING.give,
    curve: values.curve ?? DEFAULT_TABLE_TUNING.curve,
    follow: values.follow ?? DEFAULT_TABLE_TUNING.follow,
    snap: values.snap ?? DEFAULT_TABLE_TUNING.snap,
    stagger: values.stagger ?? DEFAULT_TABLE_TUNING.stagger,
    ease: values.ease ?? DEFAULT_TABLE_TUNING.ease,
    fade: values.fade ?? DEFAULT_TABLE_TUNING.fade,
    smear: values.smear ?? DEFAULT_TABLE_TUNING.smear,
    hysteresis: values.hysteresis ?? DEFAULT_TABLE_TUNING.hysteresis,
    iconOffset: values.iconOffset ?? DEFAULT_TABLE_TUNING.iconOffset,
    slow: values.slow ?? DEFAULT_TABLE_TUNING.slow,
    reduced: values.reduced ?? DEFAULT_TABLE_TUNING.reduced,
    relax: values.relax ?? DEFAULT_TABLE_TUNING.relax,
    sound: values.sound ?? DEFAULT_TABLE_TUNING.sound,
  }
}

function setTableVar(element: HTMLElement, variable: string, value: string) {
  element.style.setProperty(variable.slice(4, -1), value)
}

const relaxMs = 260
const copiedStates = [
  'color',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'fontFamily',
  'fontVariantNumeric',
] as const

interface Snapshot {
  row: Element
  left: number
  x: number
  y: number
  width: number
  height: number
  html: string
  dir: number
  clone: HTMLElement
}

interface FlipTarget {
  node: HTMLElement
  row: Element
  key: string
  inner: HTMLElement
}

function flipTargets(root: HTMLElement): FlipTarget[] {
  const targets: FlipTarget[] = []
  const viewport = root.querySelector<HTMLElement>('[role="grid"]')?.getBoundingClientRect()
  const visibleRows = new Map<Element, boolean>()
  for (const node of root.querySelectorAll<HTMLElement>('[data-flip]')) {
    const row = node.closest('[data-row]')
    const key = node.dataset.flip
    const inner = node.firstElementChild
    if (row === null || key === undefined || !(inner instanceof HTMLElement)) continue
    let visible = visibleRows.get(row)
    if (visible === undefined) {
      const box = row.getBoundingClientRect()
      const margin = box.height
      visible =
        viewport === undefined ||
        (box.bottom >= viewport.top - margin &&
          box.top <= viewport.bottom + margin &&
          box.right >= viewport.left - margin &&
          box.left <= viewport.right + margin)
      visibleRows.set(row, visible)
    }
    if (!visible) continue
    targets.push({ node, row, key, inner })
  }
  return targets
}

interface TierSpan {
  width: number
  count: number
}

interface TableMetrics {
  lead: number
  gap: number
  padding: number
  fromRow: boolean
}

interface LiveState {
  mode: number
  width: number
  dir: number
  tuning: TableTuning
  tiers: number[]
  spans: TierSpan[]
  metrics: TableMetrics | null
  relax: number
}

function tierSpansOf(columns: readonly { width: number; tier: number }[]): TierSpan[] {
  const top = columns.reduce((max, column) => Math.max(max, column.tier), 0)
  return Array.from({ length: top }, (_, index) => {
    const shown = columns.filter((column) => column.tier <= index + 1)
    return { width: shown.reduce((total, column) => total + column.width, 0), count: shown.length }
  })
}

function tiersOf(spans: readonly TierSpan[], metrics: TableMetrics | null): number[] {
  if (metrics === null) return []
  return spans.map((span) => metrics.lead + span.width + metrics.gap * span.count + metrics.padding)
}

function measureMetrics(root: HTMLElement): TableMetrics {
  const probe = document.createElement('div')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.width = tableVars.leadMin
  root.appendChild(probe)
  const lead = probe.getBoundingClientRect().width
  probe.remove()
  const row = root.querySelector<HTMLElement>('[data-row][role="row"]')
  if (row === null) return { lead, gap: 0, padding: 0, fromRow: false }
  const style = getComputedStyle(row)
  const px = (value: string) => Number.parseFloat(value) || 0
  return {
    lead,
    gap: px(style.columnGap),
    padding:
      px(style.paddingInlineStart) +
      px(style.paddingInlineEnd) +
      px(style.borderInlineStartWidth) +
      px(style.borderInlineEndWidth),
    fromRow: true,
  }
}

function modeFor(width: number, tiers: readonly number[], current: number, band: number) {
  let next = current
  while (next < tiers.length && width >= (tiers[next] ?? Infinity) + band) next += 1
  while (next > 0 && width < (tiers[next - 1] ?? 0) - band) next -= 1
  return next
}

function pull(width: number, threshold: number, zone: number, curve: number, towardsUp: boolean) {
  const distance = towardsUp ? threshold - width : width - threshold
  if (distance < 0 || distance >= zone) return 0
  return (1 - distance / zone) ** curve
}

function prefersReduced() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function dash() {
  return <span {...stylex.props(styles.dash)}>—</span>
}

interface TableProps<Row> {
  config: TableConfig<Row>
  onOpen?: (row: Row, trigger: HTMLElement) => void
  empty?: ReactNode
  footer?: ReactNode
  onSelectionChange?: (ids: ReadonlySet<string>) => void
  selectedId?: string | null
  firstRowCoachmark?: string
  tuning?: Partial<TableTuning>
}

type ResolvedColumn<Row> = TableColumn<Row> & { width: number; tier: number; dock: Dock }
type SortState = { column: string; dir: 1 | -1 } | null
type Selection = ReturnType<typeof useTableSelection>

function groupToFold<Row>(
  config: TableConfig<Row>,
  own: readonly ResolvedColumn<Row>[],
  items: readonly Item<Row>[],
  hasRows: boolean,
): Extract<Item<Row>, { kind: 'group' }> | null {
  const hasSearch = config.search !== undefined || config.searchPlaceholder !== undefined
  const hasColumnHeader = config.showHeader !== false && !hasSearch && own.length > 0 && hasRows
  if (!hasColumnHeader || config.groups?.fold === false) return null
  const groups = items.filter(
    (item): item is Extract<Item<Row>, { kind: 'group' }> => item.kind === 'group',
  )
  return groups.length === 1 ? (groups[0] ?? null) : null
}

interface TableMarkupProps<Row> {
  config: TableConfig<Row>
  own: ResolvedColumn<Row>[]
  dockedLead: ResolvedColumn<Row>[]
  dockedTrail: ResolvedColumn<Row>[]
  empty?: ReactNode
  footer?: ReactNode
  selectedId: string | null | undefined
  firstRowCoachmark: string | undefined
  opens: boolean
  tuning: TableTuning
  root: (element: HTMLDivElement | null) => void | (() => void)
  ghostLayer: (element: HTMLDivElement | null) => void
  searchRef: RefObject<HTMLInputElement | null>
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  chip: string
  setChip: Dispatch<SetStateAction<string>>
  sort: SortState
  setSort: Dispatch<SetStateAction<SortState>>
  pageSize: number
  shownCount: number
  totalCount: number
  setShown: Dispatch<SetStateAction<number>>
  reduced: boolean
  draggingColumn: string | null
  dragChip: RefObject<HTMLDivElement | null>
  dropLine: RefObject<HTMLDivElement | null>
  onColumnPointerDown: (id: string, event: ReactPointerEvent<HTMLButtonElement>) => void
  onColumnPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onColumnPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onColumnPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onColumnMove: (id: string, direction: -1 | 1, control: HTMLButtonElement) => void
  onColumnCancel: () => boolean
  consumeSuppressedClick: () => boolean
  searched: Row[]
  items: Item<Row>[]
  ids: string[]
  pick: Selection
  virtual: ReturnType<typeof useVirtualRows>
  virtualized: boolean
}

interface ColumnDrag {
  columnId: string
  originIndex: number
  pointerId: number
  startX: number
  startY: number
  targetIndex: number
  dragging: boolean
  cell: HTMLButtonElement
  header: HTMLElement
}

function completeColumnOrder(ids: readonly string[], preferred: readonly string[]) {
  const available = new Set(ids)
  const seen = new Set<string>()
  const order: string[] = []
  for (const id of preferred) {
    if (!available.has(id) || seen.has(id)) continue
    order.push(id)
    seen.add(id)
  }
  for (const id of ids) {
    if (seen.has(id)) continue
    order.push(id)
    seen.add(id)
  }
  return order
}

function readColumnOrder(id: string | undefined, ids: readonly string[]) {
  if (id === undefined) return [...ids]
  try {
    const value: unknown = JSON.parse(readStored('tableColumns', id) ?? 'null')
    return completeColumnOrder(ids, isStringArray(value) ? value : ids)
  } catch {
    return [...ids]
  }
}

function moveVisibleColumn(
  order: readonly string[],
  visible: readonly string[],
  columnId: string,
  targetIndex: number,
) {
  const visibleSet = new Set(visible)
  const current = order.filter((id) => visibleSet.has(id))
  const from = current.indexOf(columnId)
  if (from < 0) return [...order]
  const next = [...current]
  next.splice(from, 1)
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, columnId)
  if (next.every((id, index) => id === current[index])) return [...order]
  let index = 0
  return order.map((id) => {
    if (!visibleSet.has(id)) return id
    const nextId = next[index]
    index += 1
    return nextId ?? id
  })
}

function strainOf<Row>(
  reduced: boolean,
  column: ResolvedColumn<Row>,
  docked: boolean,
  outer: boolean,
) {
  if (reduced) return null
  const toward = column.dock === 'lead' ? 1 : -1
  const sign = docked ? toward : -toward
  const tier = STRAIN_VARS[column.tier] ?? tableVars.s8
  return dynamicTableStyles.strain(tier, outer ? tableVars.give : tableVars.strain, sign)
}

function dirOf<Row>(column: ResolvedColumn<Row>) {
  if (column.dock === 'lead') return -1
  if (column.dock === 'trail') return 1
  return 0
}

function smearOf<Row>(reduced: boolean, column: ResolvedColumn<Row>) {
  return (
    column.dock === 'lead' &&
    !reduced &&
    dynamicTableStyles.smear(STRAIN_VARS[column.tier] ?? tableVars.s8, 1)
  )
}

function toggleSort<Row>(markup: TableMarkupProps<Row>, column: string) {
  playSound('press', markup.tuning.sound)
  markup.setShown(markup.pageSize)
  markup.setSort((current) =>
    current?.column === column ? { column, dir: current.dir === 1 ? -1 : 1 } : { column, dir: 1 },
  )
}

function SortArrow({
  active,
  dir,
  reduced,
}: {
  active: boolean
  dir: number | undefined
  reduced: boolean
}) {
  return (
    <span
      {...stylex.props(styles.sortArrow, reduced && styles.motionOff, active && styles.sortArrowOn)}
    >
      <Icon icon={sortIcon(active, dir)} size="sm" />
    </span>
  )
}

function ColumnGlyph<Row>({
  column,
  scope,
  reduced,
}: {
  column: ResolvedColumn<Row>
  scope: string
  reduced: boolean
}) {
  if (column.icon === undefined) {
    return (
      <span title={column.label} {...stylex.props(styles.glyph)}>
        {column.label}
      </span>
    )
  }
  return (
    <span
      data-flip={`${scope}:${column.id}`}
      data-dir={dirOf(column)}
      {...stylex.props(
        styles.iconFade,
        reduced && styles.motionOff,
        !reduced &&
          column.tier !== 0 &&
          dynamicTableStyles.iconOpacity(STRAIN_VARS[column.tier] ?? tableVars.s8),
      )}
    >
      <span {...stylex.props(styles.inner)}>
        <Icon icon={column.icon} size="sm" />
      </span>
    </span>
  )
}

function ColumnHeaderCell<Row>({
  markup,
  column,
  scope,
}: {
  markup: TableMarkupProps<Row>
  column: ResolvedColumn<Row>
  scope: string
}) {
  const { sort, draggingColumn, reduced } = markup
  const active = sort?.column === column.id && column.id !== 'lead'
  const dragged = draggingColumn === column.id
  const sortable = column.sortValue !== undefined
  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && markup.onColumnCancel()) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (!event.altKey || draggingColumn !== null) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    markup.onColumnMove(column.id, event.key === 'ArrowLeft' ? -1 : 1, event.currentTarget)
  }
  return (
    <div
      data-column-id={column.id}
      {...stylex.props(
        styles.iconCell,
        styles.draggableHeader,
        column.align === 'end' && styles.end,
        dragged && styles.dimmed,
        reduced && styles.motionOff,
        dragged && styles.grabbingHeader,
      )}
    >
      <button
        type="button"
        title={sortable ? `Sort by ${column.label}` : undefined}
        aria-label={sortable ? `Sort by ${column.label}` : `Move ${column.label}`}
        aria-pressed={sortable ? active : undefined}
        aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
        aria-roledescription="draggable column"
        onKeyDown={onKeyDown}
        onPointerDown={(event) => markup.onColumnPointerDown(column.id, event)}
        onPointerMove={markup.onColumnPointerMove}
        onPointerUp={markup.onColumnPointerUp}
        onPointerCancel={markup.onColumnPointerCancel}
        onClickCapture={(event: ReactMouseEvent<HTMLButtonElement>) => {
          if (!markup.consumeSuppressedClick()) return
          event.preventDefault()
          event.stopPropagation()
        }}
        onClick={sortable ? () => toggleSort(markup, column.id) : undefined}
        {...stylex.props(
          styles.sortButton,
          styles.headerControl,
          primitiveStyles.hitArea,
          sortable && active && styles.sortOn,
          dragged && styles.draggedHeaderControl,
          styles.draggableControl,
          dragged && styles.grabbingControl,
        )}
      >
        <ColumnGlyph column={column} scope={scope} reduced={reduced} />
        {sortable ? <SortArrow active={active} dir={sort?.dir} reduced={reduced} /> : null}
      </button>
    </div>
  )
}

function HeaderCells<Row>({ markup, scope }: { markup: TableMarkupProps<Row>; scope: string }) {
  return (
    <>
      {markup.own.map((column) => (
        <ColumnHeaderCell key={column.id} markup={markup} column={column} scope={scope} />
      ))}
    </>
  )
}

function LeadSortButton<Row>({ markup }: { markup: TableMarkupProps<Row> }) {
  if (markup.config.leadSortValue === undefined) return null
  const active = markup.sort?.column === 'lead'
  return (
    <button
      type="button"
      title="Sort by lead"
      aria-label="Sort by lead"
      aria-pressed={active}
      onClick={() => toggleSort(markup, 'lead')}
      {...stylex.props(
        styles.sortButton,
        styles.sortLead,
        primitiveStyles.hitArea,
        active && styles.sortOn,
      )}
    >
      <SortArrow active={active} dir={markup.sort?.dir} reduced={markup.reduced} />
    </button>
  )
}

function TrailSpacer<Row>({ markup }: { markup: TableMarkupProps<Row> }) {
  return markup.dockedTrail.length > 0 ? <div /> : null
}

function DockedLeadCells<Row>({
  markup,
  row,
  id,
}: {
  markup: TableMarkupProps<Row>
  row: Row
  id: string
}) {
  const { reduced } = markup
  return (
    <>
      {markup.dockedLead.map((c) => {
        const content = (c.renderDocked ?? c.render)(row)
        const isText = typeof content === 'string' || typeof content === 'number'
        return (
          <span
            key={c.id}
            data-flip={`${id}:${c.id}`}
            data-dir={dirOf(c)}
            {...stylex.props(
              styles.docked,
              isText && styles.dockedText,
              strainOf(reduced, c, true, false),
              smearOf(reduced, c),
            )}
          >
            <span {...stylex.props(isText ? styles.dockedInner : styles.inner)}>{content}</span>
          </span>
        )
      })}
    </>
  )
}

function OwnCells<Row>({
  markup,
  row,
  id,
}: {
  markup: TableMarkupProps<Row>
  row: Row
  id: string
}) {
  const { reduced } = markup
  return (
    <>
      {markup.own.map((c) => (
        <div
          key={c.id}
          role="gridcell"
          {...stylex.props(
            styles.cell,
            c.align === 'end' && styles.end,
            markup.draggingColumn === c.id && styles.dimmed,
            reduced && styles.motionOff,
          )}
        >
          <span
            data-flip={`${id}:${c.id}`}
            data-dir={dirOf(c)}
            {...stylex.props(
              styles.moving,
              c.dock !== 'none' && strainOf(reduced, c, false, false),
            )}
          >
            <span {...stylex.props(styles.inner)}>{c.render(row) ?? dash()}</span>
          </span>
        </div>
      ))}
    </>
  )
}

function DockedTrailCell<Row>({
  markup,
  row,
  id,
}: {
  markup: TableMarkupProps<Row>
  row: Row
  id: string
}) {
  const { dockedTrail, reduced } = markup
  if (dockedTrail.length === 0) return null
  return (
    <div role="gridcell" {...stylex.props(styles.trail)}>
      {dockedTrail.map((c, index) => (
        <span
          key={c.id}
          data-flip={`${id}:${c.id}`}
          data-dir={dirOf(c)}
          {...stylex.props(
            styles.trailItem,
            strainOf(reduced, c, true, index === dockedTrail.length - 1 && dockedTrail.length > 1),
            smearOf(reduced, c),
          )}
        >
          <span {...stylex.props(styles.inner)}>{(c.renderDocked ?? c.render)(row) ?? dash()}</span>
        </span>
      ))}
    </div>
  )
}

function rowStylesOf<Row>({
  markup,
  id,
  isPicked,
  joinTop,
  joinBottom,
  start,
}: {
  markup: TableMarkupProps<Row>
  id: string
  isPicked: boolean
  joinTop: boolean
  joinBottom: boolean
  start: number | undefined
}) {
  const { config, pick, virtual, virtualized } = markup
  return [
    styles.grid,
    config.compact && styles.gridCompact,
    styles.row,
    virtualized && virtualStyles.item,
    start !== undefined && virtualStyles.offset(start - virtual.offset),
    markup.opens && styles.rowOpens,
    isPicked && styles.picked,
    isPicked && joinTop && styles.joinTop,
    isPicked && joinBottom && styles.joinBottom,
    pick.focus === id && pick.keyboard && styles.focused,
  ]
}

function TableRow<Row>({
  markup,
  row,
  id,
  joinTop,
  joinBottom,
  index,
  start,
  focusTarget,
}: {
  markup: TableMarkupProps<Row>
  row: Row
  id: string
  joinTop: boolean
  joinBottom: boolean
  index: number
  start: number | undefined
  focusTarget: string | undefined
}) {
  const { config, pick, virtual, virtualized, reduced } = markup
  const isPicked = pick.selected.has(id) || markup.selectedId === id
  return (
    <div
      ref={(node) => {
        pick.register(id)(node)
        if (virtualized) virtual.virtualizer.measureElement(node)
      }}
      data-index={index}
      data-row={id}
      data-coachmark={id === markup.ids[0] ? markup.firstRowCoachmark : undefined}
      role="row"
      aria-rowindex={index + 1}
      aria-selected={isPicked}
      tabIndex={focusTarget === id ? 0 : -1}
      onPointerDown={(event) => pick.onPointerDown(id, event)}
      onPointerEnter={() => pick.onPointerEnter(id)}
      onClick={(event) => pick.onRowClick(id, event)}
      onKeyDown={(event) => pick.onRowKeyDown(id, event)}
      {...stylex.props(rowStylesOf({ markup, id, isPicked, joinTop, joinBottom, start }))}
    >
      <div role="gridcell" {...stylex.props(styles.lead)}>
        <span {...stylex.props(styles.mark)}>{config.mark(row)}</span>
        <span
          data-flip={`${id}:lead`}
          {...stylex.props(
            styles.name,
            reduced && styles.motionOff,
            !reduced && dynamicTableStyles.lift(tableVars.lift),
          )}
        >
          <span {...stylex.props(styles.nameInner)}>{config.label(row)}</span>
        </span>
        <DockedLeadCells markup={markup} row={row} id={id} />
      </div>
      <OwnCells markup={markup} row={row} id={id} />
      <DockedTrailCell markup={markup} row={row} id={id} />
    </div>
  )
}

function DragOverlay<Row>({ markup }: { markup: TableMarkupProps<Row> }) {
  const { draggingColumn, reduced } = markup
  const draggedColumn = markup.own.find((column) => column.id === draggingColumn)
  return (
    <>
      <div
        ref={markup.dragChip}
        aria-hidden="true"
        {...stylex.props(
          styles.dragChip,
          draggingColumn !== null && styles.dragChipVisible,
          reduced && styles.motionOff,
        )}
      >
        <div
          {...stylex.props(
            styles.dragChipContent,
            draggingColumn !== null && styles.dragChipContentVisible,
            reduced && styles.dragChipContentReduced,
          )}
        >
          {draggedColumn?.icon === undefined ? null : <Icon icon={draggedColumn.icon} size="sm" />}
          {draggedColumn === undefined ? null : <span>{draggedColumn.label}</span>}
        </div>
      </div>
      <div
        ref={markup.dropLine}
        aria-hidden="true"
        {...stylex.props(
          styles.dropLine,
          draggingColumn !== null && styles.dropLineVisible,
          reduced && styles.motionOff,
        )}
      />
    </>
  )
}

function TitleBar<Row>({ config }: { config: TableConfig<Row> }) {
  if (config.title === undefined) return null
  return (
    <div {...stylex.props(styles.titleBar)}>
      {config.icon === undefined ? null : (
        <span {...stylex.props(styles.titleIcon)}>
          <Icon icon={config.icon} size="sm" />
        </span>
      )}
      <span {...stylex.props(styles.title)}>{config.title}</span>
      <span {...stylex.props(styles.count)}>{config.rows.length}</span>
    </div>
  )
}

function ChipBar<Row>({ markup }: { markup: TableMarkupProps<Row> }) {
  const chips = markup.config.chips
  if (chips === undefined) return null
  return (
    <div role="toolbar" aria-label="Filter" {...stylex.props(styles.chipBar)}>
      {[{ value: 'all', label: 'All', tone: null }, ...chips.options].map((option) => {
        const on = markup.chip === option.value
        const count =
          option.value === 'all'
            ? markup.searched.length
            : markup.searched.filter((row) => chips.valueOf(row) === option.value).length
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              playSound('tick', markup.tuning.sound)
              markup.setChip(option.value)
              markup.setShown(markup.pageSize)
            }}
            {...stylex.props(
              styles.chip,
              primitiveStyles.hitArea,
              on && styles.chipOn,
              markup.reduced && styles.motionOff,
            )}
          >
            {option.tone === null ? null : <Dot tone={option.tone} />}
            {option.label}
            <span {...stylex.props(styles.chipCount, on && styles.chipCountOn)}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function ColumnHeaderRow<Row>({
  markup,
  headerGroup,
}: {
  markup: TableMarkupProps<Row>
  headerGroup: Extract<Item<Row>, { kind: 'group' }> | null
}) {
  return (
    <div
      data-row="h:columns"
      data-column-header=""
      {...stylex.props(styles.grid, markup.config.compact && styles.gridCompact, styles.header)}
    >
      <div data-column-lead="" {...stylex.props(styles.headerLead)}>
        {headerGroup === null ? null : (
          <>
            {headerGroup.group.mark}
            <span {...stylex.props(styles.groupLabel, styles.nameInner)}>
              {headerGroup.group.label}
            </span>
            <span {...stylex.props(styles.groupCount)}>{headerGroup.size}</span>
          </>
        )}
        <LeadSortButton markup={markup} />
      </div>
      <HeaderCells markup={markup} scope="columns" />
      <TrailSpacer markup={markup} />
    </div>
  )
}

function SearchHeaderRow<Row>({
  markup,
  hasSearchMark,
}: {
  markup: TableMarkupProps<Row>
  hasSearchMark: boolean
}) {
  const { config, pick, pageSize } = markup
  const placeholder = config.searchPlaceholder ?? config.search ?? 'Search'
  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Tab' && !event.shiftKey) || event.key === 'ArrowDown') {
      if (pick.enterFromSearch()) event.preventDefault()
    }
    if (event.key !== 'Escape') return
    if (pick.selected.size > 0) pick.clear()
    else {
      markup.setQuery('')
      markup.setShown(pageSize)
    }
  }
  return (
    <div
      data-row="h:search"
      data-column-header=""
      {...stylex.props(styles.grid, config.compact && styles.gridCompact, styles.header)}
    >
      <div data-column-lead="" {...stylex.props(styles.headerLead)}>
        <label {...stylex.props(styles.searchLabel)}>
          <input
            ref={markup.searchRef}
            value={markup.query}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={(event) => {
              markup.setQuery(event.target.value)
              markup.setShown(pageSize)
            }}
            onKeyDown={onKeyDown}
            {...stylex.props(
              primitiveStyles.innerField,
              styles.search,
              !hasSearchMark && styles.searchRecord,
            )}
          />
        </label>
        <LeadSortButton markup={markup} />
      </div>
      <HeaderCells markup={markup} scope="search" />
      <TrailSpacer markup={markup} />
    </div>
  )
}

function GroupRow<Row>({
  markup,
  item,
  index,
  start,
}: {
  markup: TableMarkupProps<Row>
  item: Extract<Item<Row>, { kind: 'group' }>
  index: number
  start: number | undefined
}) {
  const { virtual, virtualized } = markup
  return (
    <div
      ref={virtualized ? virtual.virtualizer.measureElement : undefined}
      data-index={index}
      data-row={`h:${item.group.id}`}
      role="row"
      aria-rowindex={index + 1}
      {...stylex.props(
        styles.groupRow,
        virtualized && virtualStyles.item,
        start !== undefined && virtualStyles.offset(start - virtual.offset),
      )}
    >
      {item.group.mark}
      <span role="gridcell" {...stylex.props(styles.groupText)}>
        <span {...stylex.props(styles.groupLabel, markup.config.groups?.wrap && styles.groupWrap)}>
          {item.group.label}
        </span>
        {item.group.description === undefined ? null : (
          <span {...stylex.props(styles.groupDescription)}>{item.group.description}</span>
        )}
      </span>
      <span role="gridcell" {...stylex.props(styles.groupCount)}>
        {item.size}
      </span>
    </div>
  )
}

interface WindowItem<Row> {
  item: Item<Row> | undefined
  index: number
  start: number | undefined
}

function windowOf<Row>(markup: TableMarkupProps<Row>) {
  const { config, own, items, ids, virtual, virtualized, pick } = markup
  const headerGroup = groupToFold(config, own, items, ids.length > 0)
  const renderedItems = headerGroup === null ? items : items.filter((item) => item !== headerGroup)
  const windowItems: WindowItem<Row>[] = virtualized
    ? virtual.virtualizer.getVirtualItems().map((entry) => ({
        item: renderedItems[entry.index],
        index: entry.index,
        start: entry.start,
      }))
    : renderedItems.map((item, index) => ({ item, index, start: undefined }))
  const mountedIds = windowItems.flatMap(({ item }) => (item?.kind === 'row' ? [item.id] : []))
  const preferredFocus = pick.focus ?? ids[0]
  const focusTarget =
    preferredFocus !== undefined && mountedIds.includes(preferredFocus)
      ? preferredFocus
      : mountedIds[0]
  return { headerGroup, renderedItems, windowItems, focusTarget }
}

function TableItems<Row>({
  markup,
  view,
}: {
  markup: TableMarkupProps<Row>
  view: ReturnType<typeof windowOf<Row>>
}) {
  const { pick, virtual, virtualized } = markup
  const { renderedItems, windowItems, focusTarget } = view
  return (
    <div
      ref={virtual.listRef}
      role="rowgroup"
      {...stylex.props(
        styles.rows,
        virtualized && virtualStyles.list,
        virtualized && virtualStyles.height(virtual.virtualizer.getTotalSize()),
      )}
    >
      {windowItems.map(({ item, index, start }) => {
        if (item === undefined) return null
        if (item.kind === 'group') {
          return (
            <GroupRow
              key={`g:${item.group.id}`}
              markup={markup}
              item={item}
              index={index}
              start={start}
            />
          )
        }
        const prev = renderedItems[index - 1]
        const next = renderedItems[index + 1]
        return (
          <TableRow
            key={item.id}
            markup={markup}
            row={item.row}
            id={item.id}
            joinTop={prev?.kind === 'row' && pick.selected.has(prev.id)}
            joinBottom={next?.kind === 'row' && pick.selected.has(next.id)}
            index={index}
            start={start}
            focusTarget={focusTarget}
          />
        )
      })}
    </div>
  )
}

function TableFooter<Row>({ markup }: { markup: TableMarkupProps<Row> }) {
  if (markup.shownCount >= markup.totalCount) return markup.footer
  return (
    <TablePagination
      shownCount={markup.shownCount}
      totalCount={markup.totalCount}
      onShowMore={() => {
        playSound('press', markup.tuning.sound)
        markup.setShown((current) => current + markup.pageSize)
      }}
    />
  )
}

function TableMarkup<Row>(markup: TableMarkupProps<Row>) {
  const { config, own, ids, empty } = markup
  const hasSearch = config.search !== undefined || config.searchPlaceholder !== undefined
  const firstRow = config.rows[0]
  const searchMark = firstRow === undefined ? null : config.mark(firstRow)
  const hasSearchMark = searchMark !== null && searchMark !== undefined && searchMark !== false
  const showColumnHeader =
    config.showHeader !== false && !hasSearch && own.length > 0 && ids.length > 0
  const view = windowOf(markup)
  return (
    <div ref={markup.root} {...stylex.props(styles.root)}>
      <div ref={markup.ghostLayer} {...stylex.props(styles.ghosts)} />
      <DragOverlay markup={markup} />
      <TitleBar config={config} />
      <ChipBar markup={markup} />
      <div
        role="grid"
        aria-label={config.ariaLabel ?? config.title ?? 'Data table'}
        aria-multiselectable="true"
        aria-rowcount={view.renderedItems.length}
        {...stylex.props(styles.body, config.compact && styles.bodyCompact)}
      >
        {showColumnHeader ? (
          <ColumnHeaderRow markup={markup} headerGroup={view.headerGroup} />
        ) : null}
        {hasSearch ? <SearchHeaderRow markup={markup} hasSearchMark={hasSearchMark} /> : null}
        {ids.length === 0 ? (
          <div {...stylex.props(styles.empty)}>{empty === undefined ? 'No matches' : empty}</div>
        ) : null}
        <TableItems markup={markup} view={view} />
      </div>
      <TableFooter markup={markup} />
    </div>
  )
}

export function TablePagination({
  shownCount,
  totalCount,
  pending = false,
  onShowMore,
}: {
  shownCount: number
  totalCount: number
  pending?: boolean
  onShowMore: () => void
}) {
  return (
    <div {...stylex.props(styles.pagination)}>
      <span {...stylex.props(styles.paginationCount)}>
        {shownCount} of {totalCount}
      </span>
      <Button variant="ghost" size="sm" disabled={pending} aria-busy={pending} onClick={onShowMore}>
        <span {...stylex.props(styles.paginationLabel)}>
          <span
            {...stylex.props(styles.paginationLabelItem, pending && styles.paginationLabelHidden)}
          >
            Show more
          </span>
          <span
            {...stylex.props(styles.paginationLabelItem, !pending && styles.paginationLabelHidden)}
          >
            Loading…
          </span>
        </span>
      </Button>
    </div>
  )
}

function sortIcon(active: boolean, dir: number | undefined) {
  if (!active) return icons.sort
  return dir === -1 ? icons.sortDescending : icons.sortAscending
}

function resolveColumns<Row>(config: TableConfig<Row>, order: readonly string[]) {
  const ids = config.columns.map((column) => column.id)
  const columnOrder = completeColumnOrder(ids, order)
  const orderPosition = new Map(columnOrder.map((id, index) => [id, index]))
  const columns: ResolvedColumn<Row>[] = config.columns
    .map((column) => ({
      ...column,
      width: column.width ?? 140,
      tier: column.tier ?? 0,
      dock: column.dock ?? 'none',
    }))
    .sort((left, right) => (orderPosition.get(left.id) ?? 0) - (orderPosition.get(right.id) ?? 0))
  return { columnOrder, columns }
}

function sortRows<Row>(
  config: TableConfig<Row>,
  columns: readonly ResolvedColumn<Row>[],
  rows: Row[],
  sort: SortState,
) {
  let keyOf: TableColumn<Row>['sortValue']
  if (sort?.column === 'lead') {
    keyOf = config.leadSortValue
  } else if (sort !== null) {
    keyOf = columns.find((column) => column.id === sort.column)?.sortValue
  }
  if (sort === null || keyOf === undefined) return rows
  return [...rows].sort((a, b) => {
    const x = keyOf(a)
    const y = keyOf(b)
    return (
      (typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y))) * sort.dir
    )
  })
}

function itemsOf<Row>(config: TableConfig<Row>, filtered: Row[], pageRows: Row[]) {
  const { rowId } = config
  const items: Item<Row>[] = []
  if (config.groups === undefined) {
    for (const row of pageRows) items.push({ kind: 'row', row, id: rowId(row) })
    return items
  }
  const pageIds = new Set(pageRows.map(rowId))
  const { list, of } = config.groups
  for (const group of list) {
    const members = filtered.filter((row) => of(row) === group.id)
    const pageMembers = members.filter((row) => pageIds.has(rowId(row)))
    if (pageMembers.length === 0) continue
    items.push({ kind: 'group', group, size: members.length })
    for (const row of pageMembers) items.push({ kind: 'row', row, id: rowId(row) })
  }
  return items
}

function deriveRows<Row>({
  config,
  columns,
  query,
  chip,
  sort,
  shown,
  mode,
}: {
  config: TableConfig<Row>
  columns: ResolvedColumn<Row>[]
  query: string
  chip: string
  sort: SortState
  shown: number
  mode: number
}) {
  const needle = query.trim().toLowerCase()
  const searched = config.rows.filter(
    (row) => needle === '' || config.searchText(row).toLowerCase().includes(needle),
  )
  const visible = sortRows(config, columns, searched, sort)
  const chips = config.chips
  const filtered = visible.filter(
    (row) => chips === undefined || chip === 'all' || chips.valueOf(row) === chip,
  )
  const groups = config.groups
  const displayRows =
    groups === undefined
      ? filtered
      : groups.list.flatMap((group) => filtered.filter((row) => groups.of(row) === group.id))
  const pageRows = displayRows.slice(0, shown)
  const items = itemsOf(config, filtered, pageRows)
  const ids = items.flatMap((item) => (item.kind === 'row' ? [item.id] : []))
  const own = columns.filter((c) => c.tier === 0 || c.tier <= mode)
  const foldedGroup = groupToFold(config, own, items, ids.length > 0)
  return {
    searched,
    displayRows,
    pageRows,
    items,
    ids,
    byId: new Map(visible.map((row) => [config.rowId(row), row])),
    own,
    renderItems: foldedGroup === null ? items : items.filter((item) => item !== foldedGroup),
    dockedLead: columns.filter((c) => c.tier > mode && c.dock === 'lead'),
    dockedTrail: columns.filter((c) => c.tier > mode && c.dock === 'trail'),
  }
}

function templateOf<Row>(columns: readonly ResolvedColumn<Row>[], mode: number) {
  const ownColumns = columns.filter((column) => column.tier === 0 || column.tier <= mode)
  const trailing = columns.some((column) => column.tier > mode && column.dock === 'trail')
  return [
    `minmax(${tableVars.leadMin}, 1fr)`,
    ...ownColumns.map((column) => `${column.width}px`),
    ...(trailing ? ['auto'] : []),
  ].join(' ')
}

function writeStrain(el: HTMLElement | null, state: LiveState, leadTiers: ReadonlySet<number>) {
  if (el === null) return
  const { width, dir, tuning: t, tiers: tierList } = state
  const band = t.hysteresis / 2
  const motionOff = t.reduced === 'on' || prefersReduced()
  let give = 0
  tierList.forEach((threshold, index) => {
    const tier = index + 1
    const split = state.mode >= tier
    let s = 0
    if (!motionOff && dir > 0 && !split) s = pull(width, threshold + band, t.zone, t.curve, true)
    if (!motionOff && dir < 0 && split) s = pull(width, threshold - band, t.zone, t.curve, false)
    setTableVar(el, STRAIN_VARS[tier] ?? tableVars.s8, s.toFixed(4))
    if (leadTiers.has(tier)) give = Math.max(give, s)
  })
  setTableVar(el, tableVars.lift, give.toFixed(4))
}

function trackAnimation(animations: Set<Animation>, animation: Animation) {
  animations.add(animation)
  void animation.finished.then(
    () => animations.delete(animation),
    () => animations.delete(animation),
  )
  return animation
}

function captureFlip(el: HTMLElement, animations: Set<Animation>) {
  const base = el.getBoundingClientRect()
  const map = new Map<string, Snapshot>()
  for (const { node, row, key, inner } of flipTargets(el)) {
    const box = inner.getBoundingClientRect()
    const clone = inner.cloneNode(true)
    if (!(clone instanceof HTMLElement)) continue
    const computed = getComputedStyle(inner)
    for (const prop of copiedStates) clone.style[prop] = computed[prop]
    map.set(key, {
      row,
      left: node.getBoundingClientRect().left - row.getBoundingClientRect().left,
      x: box.left - base.left,
      y: box.top - base.top,
      width: box.width,
      height: box.height,
      html: inner.innerHTML,
      dir: Number(node.dataset.dir ?? '0'),
      clone,
    })
  }
  for (const animation of animations) animation.cancel()
  animations.clear()
  return map
}

function ghostOf(layer: HTMLDivElement | null, snap: Snapshot) {
  if (layer === null) return null
  const node = snap.clone
  const cls = stylex.props(styles.ghost).className
  if (cls !== undefined) node.className = `${node.className} ${cls}`
  node.style.left = `${snap.x}px`
  node.style.top = `${snap.y}px`
  node.style.width = `${snap.width}px`
  node.style.height = `${snap.height}px`
  layer.appendChild(node)
  return node
}

function rowsInView(el: HTMLElement) {
  const viewport = el.querySelector<HTMLElement>('[role="grid"]')?.getBoundingClientRect()
  return Array.from(el.querySelectorAll('[data-row][role="row"]')).filter((row) => {
    const box = row.getBoundingClientRect()
    return (
      box.bottom > Math.max(0, viewport?.top ?? 0) &&
      box.top < Math.min(window.innerHeight, viewport?.bottom ?? window.innerHeight) &&
      box.right > Math.max(0, viewport?.left ?? 0) &&
      box.left < Math.min(window.innerWidth, viewport?.right ?? window.innerWidth)
    )
  })
}

function removeAfter(animation: Animation, copy: HTMLElement) {
  animation.finished.then(
    () => copy.remove(),
    () => copy.remove(),
  )
}

function animateFlip({
  el,
  prior,
  tuning: t,
  layer,
  animations,
}: {
  el: HTMLElement
  prior: Map<string, Snapshot>
  tuning: TableTuning
  layer: HTMLDivElement | null
  animations: Set<Animation>
}) {
  const duration = t.snap * t.slow
  const exit = duration * 0.6
  const offset = t.iconOffset
  const base = el.getBoundingClientRect()
  const seen = new Set<string>()
  const rows = rowsInView(el)
  const step = Math.min(t.stagger, 240 / Math.max(1, rows.length - 1)) * t.slow
  const pending: Animation[] = []
  const delayFor = (row: Element) => {
    const index = rows.indexOf(row)
    return index < 0 ? 0 : index * step
  }
  const run = (element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = element.animate(frames, options)
    pending.push(animation)
    return trackAnimation(animations, animation)
  }
  for (const { node, row, key, inner } of flipTargets(el)) {
    seen.add(key)
    const delay = delayFor(row)
    const old = prior.get(key)
    if (old === undefined) {
      const dir = Number(node.dataset.dir ?? '0')
      run(
        inner,
        [
          {
            transform: `translateX(${dir * offset}px) scale(${dir === 0 ? 0.96 : 1})`,
            opacity: 0,
            offset: 0,
          },
          { opacity: 1, offset: 0.33 },
          { transform: 'none', opacity: 1, offset: 1 },
        ],
        { duration, delay, fill: 'backwards', easing: cssEasing(t.ease) },
      )
      continue
    }
    const dx = old.left - (node.getBoundingClientRect().left - row.getBoundingClientRect().left)
    if (old.html === inner.innerHTML) {
      if (Math.abs(dx) > 0.5) {
        run(inner, [{ transform: `translateX(${dx}px)` }, { transform: 'none' }], {
          duration,
          delay,
          fill: 'backwards',
          easing: cssEasing(t.ease),
        })
      }
      continue
    }
    const box = inner.getBoundingClientRect()
    run(
      inner,
      [
        { transform: `translateX(${dx}px)`, opacity: t.fade, offset: 0 },
        {
          transform: `translateX(${dx}px)`,
          opacity: t.fade + (1 - t.fade) * (2 / 3),
          offset: 0.22,
          easing: cssEasing(t.ease),
        },
        { opacity: 1, offset: 0.33 },
        { transform: 'none', opacity: 1, offset: 1 },
      ],
      { duration, delay, fill: 'backwards', easing: 'linear' },
    )
    const copy = ghostOf(layer, old)
    if (copy === null) continue
    const tx = box.left - base.left - old.x
    const ty = box.top - base.top - old.y
    removeAfter(
      run(
        copy,
        [
          { transform: 'none', opacity: 1, offset: 0 },
          { transform: 'none', opacity: 1 / 3, offset: 0.22, easing: cssEasing(t.ease) },
          { opacity: 0, offset: 0.33 },
          { transform: `translate(${tx}px, ${ty}px)`, opacity: 0, offset: 1 },
        ],
        { duration, delay, fill: 'backwards', easing: 'linear' },
      ),
      copy,
    )
  }
  for (const [key, old] of prior) {
    if (seen.has(key)) continue
    const copy = ghostOf(layer, old)
    if (copy === null) continue
    removeAfter(
      run(
        copy,
        [
          { transform: 'none', opacity: 1 },
          {
            transform: `translateX(${old.dir * offset}px) scale(${old.dir === 0 ? 0.96 : 1})`,
            opacity: 0,
          },
        ],
        {
          duration: exit,
          delay: delayFor(old.row),
          fill: 'backwards',
          easing: cssEasing(motion.easeExit),
        },
      ),
      copy,
    )
  }
  return Promise.all(
    pending.map((animation) =>
      animation.finished.then(
        () => undefined,
        () => undefined,
      ),
    ),
  ).then(() => undefined)
}

function flashColumnCells(element: HTMLElement, columnId: string, animations: Set<Animation>) {
  const duration =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--thc-duration-exit'),
    ) * 2
  const cells = new Set<HTMLElement>()
  for (const cell of element.querySelectorAll<HTMLElement>('[data-column-id]')) {
    if (cell.dataset.columnId === columnId) cells.add(cell)
  }
  for (const inner of element.querySelectorAll<HTMLElement>('[data-flip]')) {
    if (!inner.dataset.flip?.endsWith(`:${columnId}`)) continue
    const cell = inner.closest<HTMLElement>('[role="gridcell"]')
    if (cell !== null) cells.add(cell)
  }
  for (const cell of cells) {
    trackAnimation(
      animations,
      cell.animate(
        [{ backgroundColor: color.backgroundSurfaceHover }, { backgroundColor: 'transparent' }],
        { duration, easing: cssEasing(motion.ease) },
      ),
    )
  }
}

function dropTargetIndex(targets: readonly DOMRect[], clientX: number) {
  let targetIndex = 0
  while (
    targetIndex < targets.length &&
    clientX >= ((targets[targetIndex]?.left ?? 0) + (targets[targetIndex]?.right ?? 0)) / 2
  ) {
    targetIndex += 1
  }
  return targetIndex
}

function positionColumnDrag({
  element,
  drag,
  clientX,
  clientY,
  reduced,
  chip,
  line,
}: {
  element: HTMLElement
  drag: ColumnDrag
  clientX: number
  clientY: number
  reduced: boolean
  chip: HTMLDivElement | null
  line: HTMLDivElement | null
}) {
  const rootBounds = element.getBoundingClientRect()
  if (chip !== null) {
    chip.style.transform = `translate3d(${clientX - rootBounds.left + 12}px, ${clientY - rootBounds.top - 18}px, 0) rotate(${reduced ? 0 : 2}deg)`
  }
  const cells = Array.from(drag.header.querySelectorAll<HTMLElement>('[data-column-id]'))
  const bounds = cells
    .filter((cell) => cell.dataset.columnId !== drag.columnId)
    .map((cell) => cell.getBoundingClientRect())
  const firstCellBounds = cells[0]?.getBoundingClientRect()
  const sourceBounds = cells
    .find((cell) => cell.dataset.columnId === drag.columnId)
    ?.getBoundingClientRect()
  const targetIndex = dropTargetIndex(bounds, clientX)
  drag.targetIndex = targetIndex
  const headerBounds = drag.header.getBoundingClientRect()
  const gridBounds = element.querySelector<HTMLElement>('[role="grid"]')?.getBoundingClientRect()
  const leadBounds = drag.header
    .querySelector<HTMLElement>('[data-column-lead]')
    ?.getBoundingClientRect()
  const halfGap =
    firstCellBounds === undefined || leadBounds === undefined
      ? 0
      : (firstCellBounds.left - leadBounds.right) / 2
  let previousBounds: DOMRect | undefined
  if (targetIndex === drag.originIndex) {
    previousBounds = sourceBounds
  } else if (targetIndex === 0) {
    previousBounds = leadBounds
  } else {
    previousBounds = bounds[targetIndex - 1]
  }
  const edge = (previousBounds?.right ?? sourceBounds?.right ?? rootBounds.left) + halfGap
  if (line === null) return
  line.style.transform = `translate3d(${edge - rootBounds.left - 1}px, 0, 0)`
  line.style.top = `${headerBounds.top - rootBounds.top}px`
  line.style.height = `${Math.max(0, (gridBounds?.bottom ?? headerBounds.bottom) - headerBounds.top)}px`
}

interface DropLineTimers {
  frame: { current: number }
  exitCleanup: { current: (() => void) | null }
}

function startDropLine(line: HTMLDivElement | null, reduced: boolean, timers: DropLineTimers) {
  if (line === null) return
  timers.exitCleanup.current?.()
  timers.exitCleanup.current = null
  cancelAnimationFrame(timers.frame.current)
  line.style.opacity = ''
  line.style.transitionDuration = ''
  line.style.visibility = ''
  if (reduced) {
    line.style.transitionProperty = 'none'
    return
  }
  line.style.transitionProperty = 'opacity'
  timers.frame.current = requestAnimationFrame(() => {
    line.style.transitionProperty = ''
  })
}

function hideDropLine(line: HTMLDivElement | null, reduced: boolean, timers: DropLineTimers) {
  if (line === null) return
  cancelAnimationFrame(timers.frame.current)
  timers.exitCleanup.current?.()
  const finish = () => {
    line.style.opacity = ''
    line.style.transitionDuration = ''
    line.style.transitionProperty = ''
    line.style.visibility = ''
    timers.exitCleanup.current = null
  }
  if (reduced) {
    finish()
    return
  }
  const onEnd = () => finish()
  line.addEventListener('transitionend', onEnd, { once: true })
  timers.exitCleanup.current = () => line.removeEventListener('transitionend', onEnd)
  line.style.opacity = '0'
  line.style.transitionDuration = `calc(${motion.durationExit} * 2 / 3)`
  line.style.transitionProperty = 'opacity'
  line.style.visibility = 'visible'
}

function releaseColumnPointer(drag: ColumnDrag) {
  if (drag.cell.hasPointerCapture(drag.pointerId)) {
    drag.cell.releasePointerCapture(drag.pointerId)
  }
}

function headerColumnIds(header: HTMLElement) {
  return Array.from(header.querySelectorAll<HTMLElement>('[data-column-id]')).flatMap((cell) =>
    cell.dataset.columnId === undefined ? [] : [cell.dataset.columnId],
  )
}

function useColumnDrag({
  root,
  ownIds,
  columnOrder,
  commitColumnOrder,
  reduced,
  sound,
}: {
  root: RefObject<HTMLDivElement | null>
  ownIds: readonly string[]
  columnOrder: readonly string[]
  commitColumnOrder: (next: readonly string[], movedColumnId?: string) => boolean
  reduced: boolean
  sound: number
}) {
  const dragChip = useRef<HTMLDivElement>(null)
  const dropLine = useRef<HTMLDivElement>(null)
  const columnDrag = useRef<ColumnDrag | null>(null)
  const dropLineFrame = useRef(0)
  const dropLineExitCleanup = useRef<(() => void) | null>(null)
  const suppressHeaderClick = useRef(false)
  const suppressHeaderClickTimer = useRef(0)
  const [draggingColumn, setDraggingColumn] = useState<string | null>(null)
  const timers: DropLineTimers = { frame: dropLineFrame, exitCleanup: dropLineExitCleanup }

  const update = (drag: ColumnDrag, clientX: number, clientY: number) => {
    const element = root.current
    if (element === null) return
    positionColumnDrag({
      element,
      drag,
      clientX,
      clientY,
      reduced,
      chip: dragChip.current,
      line: dropLine.current,
    })
  }

  const suppressNextHeaderClick = () => {
    suppressHeaderClick.current = true
    window.clearTimeout(suppressHeaderClickTimer.current)
    suppressHeaderClickTimer.current = window.setTimeout(() => {
      suppressHeaderClick.current = false
    }, 500)
  }

  const endDrag = () => {
    suppressNextHeaderClick()
    hideDropLine(dropLine.current, reduced, timers)
    setDraggingColumn(null)
  }

  const activeDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = columnDrag.current
    return drag === null || drag.pointerId !== event.pointerId ? null : drag
  }

  return {
    draggingColumn,
    dragChip,
    dropLine,
    dispose: () => {
      window.clearTimeout(suppressHeaderClickTimer.current)
      cancelAnimationFrame(dropLineFrame.current)
      dropLineExitCleanup.current?.()
    },
    onColumnPointerDown: (columnId: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || !event.isPrimary || columnDrag.current !== null) return
      const header = event.currentTarget.closest('[data-column-header]')
      if (!(header instanceof HTMLElement)) return
      const originIndex = Math.max(0, ownIds.indexOf(columnId))
      columnDrag.current = {
        columnId,
        originIndex,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        targetIndex: originIndex,
        dragging: false,
        cell: event.currentTarget,
        header,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onColumnPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = activeDrag(event)
      if (drag === null) return
      if (!drag.dragging) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <= 4) return
        drag.dragging = true
        startDropLine(dropLine.current, reduced, timers)
        setDraggingColumn(drag.columnId)
        playSound('press', sound)
      }
      update(drag, event.clientX, event.clientY)
    },
    onColumnPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = activeDrag(event)
      if (drag === null) return
      releaseColumnPointer(drag)
      if (drag.dragging) {
        update(drag, event.clientX, event.clientY)
        const next = moveVisibleColumn(
          columnOrder,
          headerColumnIds(drag.header),
          drag.columnId,
          drag.targetIndex,
        )
        suppressNextHeaderClick()
        if (commitColumnOrder(next, drag.columnId)) playSound('tick', sound)
        hideDropLine(dropLine.current, reduced, timers)
        setDraggingColumn(null)
      }
      columnDrag.current = null
    },
    onColumnPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = activeDrag(event)
      if (drag === null) return
      releaseColumnPointer(drag)
      if (drag.dragging) endDrag()
      columnDrag.current = null
    },
    onColumnCancel: () => {
      const drag = columnDrag.current
      if (drag === null || !drag.dragging) return false
      releaseColumnPointer(drag)
      columnDrag.current = null
      endDrag()
      return true
    },
    consumeSuppressedClick: () => {
      if (!suppressHeaderClick.current) return false
      suppressHeaderClick.current = false
      window.clearTimeout(suppressHeaderClickTimer.current)
      return true
    },
    onColumnMove: (columnId: string, direction: -1 | 1, control: HTMLButtonElement) => {
      if (columnDrag.current?.dragging) return
      const index = ownIds.indexOf(columnId)
      const targetIndex = Math.max(0, Math.min(ownIds.length - 1, index + direction))
      if (index < 0 || targetIndex === index) return
      const next = moveVisibleColumn(columnOrder, ownIds, columnId, targetIndex)
      if (!commitColumnOrder(next, columnId)) return
      playSound('tick', sound)
      control.focus()
    },
  }
}

export function Table<Row>({
  config,
  onOpen,
  empty,
  footer,
  onSelectionChange,
  selectedId,
  firstRowCoachmark,
  tuning: partialTuning,
}: TableProps<Row>) {
  const tuning = tuningOf(partialTuning)
  const pageSize = Math.max(1, Math.floor(config.pageSize ?? 15))
  const [order, setOrder] = useState<readonly string[]>(() =>
    readColumnOrder(
      config.id,
      config.columns.map((column) => column.id),
    ),
  )
  const { columnOrder, columns } = resolveColumns(config, order)
  const spans = tierSpansOf(columns)
  const root = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState(0)
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState('all')
  const [sort, setSort] = useState(config.defaultSort ?? null)
  const [shown, setShown] = useState(pageSize)
  const live = useRef<LiveState>({
    mode: 0,
    width: 0,
    dir: 0,
    tuning,
    tiers: [],
    spans,
    metrics: null,
    relax: 0,
  })
  live.current.tuning = tuning
  live.current.spans = spans
  live.current.tiers = tiersOf(spans, live.current.metrics)
  const ghostLayer = useRef<HTMLDivElement>(null)
  const before = useRef<Map<string, Snapshot> | null>(null)
  const animations = useRef(new Set<Animation>())

  const reduced = tuning.reduced === 'on' || prefersReduced()
  const leadTiers = new Set(columns.filter((c) => c.dock === 'lead').map((c) => c.tier))
  const templateForRef = useRef({ render: (nextMode: number) => templateOf(columns, nextMode) })
  templateForRef.current.render = (nextMode: number) => templateOf(columns, nextMode)

  const rows = deriveRows({ config, columns, query, chip, sort, shown, mode })
  const { renderItems, own } = rows
  const virtualized = renderItems.length > VIRTUAL_ROWS_FROM
  const virtual = useVirtualRows(renderItems.length, 44, {
    enabled: virtualized,
    keyOf: (index) => {
      const item = renderItems[index]
      return item?.kind === 'row' ? item.id : `g:${item?.group.id}`
    },
    headerSize: 48,
  })

  const pick = useTableSelection({
    ids: rows.ids,
    onFocusMissing: (id) => {
      const index = renderItems.findIndex((item) => item.kind === 'row' && item.id === id)
      if (index >= 0 && virtualized) virtual.virtualizer.scrollToIndex(index, { align: 'auto' })
    },
    onOpen: (id, trigger) => {
      const row = rows.byId.get(id)
      if (row === undefined || onOpen === undefined) return
      playSound('page', tuning.sound)
      onOpen(row, trigger)
    },
    ...(onSelectionChange === undefined ? {} : { onSelectionChange }),
    onLeave: () => searchRef.current?.focus(),
    onSound: (name) => playSound(name, tuning.sound),
  })

  const template = templateOf(columns, mode)
  const { strain, give, smear, follow, slow } = tuning
  const trackLayout = useCallback(
    (node: HTMLDivElement | null) => {
      ghostLayer.current = node
      const element = node?.parentElement
      if (element === null || element === undefined) return
      setTableVar(element, tableVars.columns, template)
      setTableVar(element, tableVars.strain, `${strain}px`)
      setTableVar(element, tableVars.give, `${give}px`)
      setTableVar(element, tableVars.smear, `${smear}px`)
      setTableVar(element, tableVars.follow, reduced ? '0ms' : `${follow * slow}ms`)
    },
    [template, strain, give, smear, reduced, follow, slow],
  )

  const setRoot = useCallback((element: HTMLDivElement | null) => {
    root.current = element
  }, [])

  const strainNow = () => writeStrain(root.current, live.current, leadTiers)

  const capture = () => {
    const el = root.current
    if (el === null) return
    before.current = captureFlip(el, animations.current)
  }

  const animate = () => {
    const el = root.current
    const prior = before.current
    before.current = null
    const t = live.current.tuning
    const motionOff = t.reduced === 'on' || prefersReduced()
    if (el === null || prior === null || motionOff) return Promise.resolve()
    return animateFlip({
      el,
      prior,
      tuning: t,
      layer: ghostLayer.current,
      animations: animations.current,
    })
  }

  const onWidth = (width: number) => {
    const state = live.current
    const el = root.current
    if (el !== null && state.metrics?.fromRow !== true) {
      state.metrics = measureMetrics(el)
      state.tiers = tiersOf(state.spans, state.metrics)
    }
    if (Math.abs(width - state.width) < 0.25) return
    state.dir = width > state.width ? 1 : -1
    state.width = width
    const next = modeFor(width, state.tiers, state.mode, state.tuning.hysteresis / 2)
    if (next !== state.mode) {
      capture()
      state.mode = next
      flushSync(() => setMode(next))
      if (el !== null) setTableVar(el, tableVars.columns, templateForRef.current.render(next))
      void animate()
      playSound('tick', 0.5 * state.tuning.sound)
    }
    strainNow()
    window.clearTimeout(state.relax)
    if (!state.tuning.relax) return
    state.relax = window.setTimeout(() => {
      state.dir = 0
      strainNow()
    }, relaxMs)
  }

  const commitColumnOrder = (next: readonly string[], movedColumnId?: string) => {
    if (next.every((id, index) => id === columnOrder[index])) return false
    capture()
    flushSync(() => setOrder(next))
    const element = root.current
    if (element !== null) {
      setTableVar(element, tableVars.columns, templateForRef.current.render(live.current.mode))
    }
    const settled = animate()
    if (movedColumnId !== undefined) {
      void settled.then(() => {
        const current = root.current
        if (reduced || current === null) return
        flashColumnCells(current, movedColumnId, animations.current)
      })
    }
    if (config.id !== undefined) {
      writeStored('tableColumns', JSON.stringify(next), config.id)
    }
    return true
  }

  const drag = useColumnDrag({
    root,
    ownIds: own.map((column) => column.id),
    columnOrder,
    commitColumnOrder,
    reduced,
    sound: tuning.sound,
  })

  useMountEffect(() => {
    const el = root.current
    if (el === null) return
    const start = el.getBoundingClientRect().width
    live.current.metrics = measureMetrics(el)
    live.current.tiers = tiersOf(spans, live.current.metrics)
    const initial = modeFor(start, live.current.tiers, live.current.tiers.length, 0)
    live.current.width = start
    live.current.mode = initial
    setMode(initial)
    setTableVar(el, tableVars.columns, templateOf(columns, initial))
    strainNow()
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry !== undefined) onWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(live.current.relax)
      drag.dispose()
      for (const animation of animations.current) animation.cancel()
      animations.current.clear()
    }
  })

  return (
    <TableMarkup<Row>
      config={config}
      own={own}
      dockedLead={rows.dockedLead}
      dockedTrail={rows.dockedTrail}
      empty={empty}
      footer={footer}
      selectedId={selectedId}
      firstRowCoachmark={firstRowCoachmark}
      opens={onOpen !== undefined}
      tuning={tuning}
      root={setRoot}
      ghostLayer={trackLayout}
      searchRef={searchRef}
      query={query}
      setQuery={setQuery}
      chip={chip}
      setChip={setChip}
      sort={sort}
      setSort={setSort}
      pageSize={pageSize}
      shownCount={rows.pageRows.length}
      totalCount={rows.displayRows.length}
      setShown={setShown}
      reduced={reduced}
      draggingColumn={drag.draggingColumn}
      dragChip={drag.dragChip}
      dropLine={drag.dropLine}
      onColumnPointerDown={drag.onColumnPointerDown}
      onColumnPointerMove={drag.onColumnPointerMove}
      onColumnPointerUp={drag.onColumnPointerUp}
      onColumnPointerCancel={drag.onColumnPointerCancel}
      onColumnMove={drag.onColumnMove}
      onColumnCancel={drag.onColumnCancel}
      consumeSuppressedClick={drag.consumeSuppressedClick}
      searched={rows.searched}
      items={rows.items}
      ids={rows.ids}
      pick={pick}
      virtual={virtual}
      virtualized={virtualized}
    />
  )
}
