import * as stylex from '@stylexjs/stylex'
import { m } from 'motion/react'
import { createContext, useContext } from 'react'
import { Link } from 'react-router'
import { formatNumber } from '@/lib/format'
import { useFluidHover } from '@/lib/hooks/use-fluid-hover'
import { spring, stagger } from '@/lib/motion'
import { Badge } from '@/ui/badge'
import { barListStyles as styles } from '@/ui/bar-list.stylex'
import { FluidHoverHighlight } from '@/ui/fluid-hover-highlight'
import { fluidItemProps } from '@/ui/fluid-item'

export interface BarListItem {
  id: string
  label: string
  value: number
  detail?: string
  tone?: 'neutral' | 'warning' | 'danger'
  href?: string
}

const BarHoverContext = createContext<(el: HTMLElement) => void>(() => undefined)

export function BarList({
  items,
  max,
  formatValue = formatNumber,
}: {
  items: BarListItem[]
  max?: number
  formatValue?: (value: number) => string
}) {
  const { containerRef, highlightProps, onItemEnter, onLeave } = useFluidHover<HTMLDivElement>()
  const peak = max ?? Math.max(...items.map((item) => Math.abs(item.value)), 1)

  return (
    <BarHoverContext.Provider value={onItemEnter}>
      <div ref={containerRef} {...stylex.props(styles.list)} onPointerLeave={onLeave}>
        <FluidHoverHighlight {...highlightProps} />
        {items.map((item, index) => (
          <BarListRow
            key={item.id}
            item={item}
            peak={peak}
            index={index}
            formatValue={formatValue}
          />
        ))}
      </div>
    </BarHoverContext.Provider>
  )
}

const badgeVariantForDetail = { warning: 'warning', danger: 'destructive' } as const

function BarDetail({ detail, tone }: { detail: string; tone: NonNullable<BarListItem['tone']> }) {
  if (tone === 'neutral') return <span {...stylex.props(styles.detail)}>{detail}</span>
  return (
    <Badge variant={badgeVariantForDetail[tone]} dot>
      {detail}
    </Badge>
  )
}

function BarListRow({
  item,
  peak,
  index,
  formatValue,
}: {
  item: BarListItem
  peak: number
  index: number
  formatValue: (value: number) => string
}) {
  const onItemEnter = useContext(BarHoverContext)
  const ratio = Math.min(Math.abs(item.value) / peak, 1)
  const handlers = fluidItemProps(onItemEnter)
  const inner = (
    <>
      <span {...stylex.props(styles.label)}>{item.label}</span>
      <span {...stylex.props(styles.plot)}>
        <span {...stylex.props(styles.track)}>
          <m.span
            {...stylex.props(styles.fill)}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: ratio }}
            transition={{ ...spring.slow, delay: stagger(index) }}
          />
        </span>
      </span>
      <span {...stylex.props(styles.value)}>
        {formatValue(item.value)}
        {item.detail && <BarDetail detail={item.detail} tone={item.tone ?? 'neutral'} />}
      </span>
    </>
  )

  if (item.href) {
    return (
      <Link to={item.href} {...handlers} {...stylex.props(styles.row, styles.rowClickable)}>
        {inner}
      </Link>
    )
  }
  return (
    <div {...handlers} {...stylex.props(styles.row)}>
      {inner}
    </div>
  )
}
