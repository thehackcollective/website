import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {
  type SankeyNode as RechartsSankeyNode,
  ResponsiveContainer,
  Sankey,
  type SankeyLinkProps,
  type SankeyNodeProps,
  Tooltip,
  type TooltipPayloadEntry,
} from 'recharts'
import { formatNumber } from '@/lib/format'
import { isRecord } from '@/lib/guards'
import { breakpoint, color, motion, radius, space, text } from '@/tokens/token-consts.stylex'

export interface SankeyChartNode {
  name: string
  hidden?: boolean
}

export interface SankeyChartLink {
  source: string
  target: string
  value: number
}

interface FlowNode {
  name: string
  hidden: boolean
}

const initialDimension = { width: 320, height: 200 } as const
const MARGIN = { top: 4, bottom: 4, left: 4, right: 4 } as const
const nodeWidth = 10

const styles = stylex.create({
  root: {
    display: 'flex',
    fontSize: text.sizeCaption,
    height: '100%',
    lineHeight: text.leadingCaption,
    width: '100%',
  },
  link: {
    fillOpacity: { default: 0.2, ':hover': { [breakpoint.hover]: 0.4 } },
    transitionDuration: motion.durationFast,
    transitionProperty: 'fill-opacity',
    transitionTimingFunction: motion.easeSmooth,
  },
  tooltip: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: radius.md,
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    fontSize: text.sizeCaption,
    gap: space.xs,
    lineHeight: text.leadingCaption,
    minWidth: '8rem',
    paddingBlock: space.xs,
    paddingInline: space.sm,
  },
  tooltipSwatch: {
    backgroundColor: 'currentColor',
    borderRadius: radius['2xs'],
    flexShrink: 0,
    height: '8px',
    width: '8px',
  },
  tooltipLabel: {
    color: color.textSubtle,
    flexBasis: '0%',
    flexGrow: 1,
    flexShrink: 1,
  },
  tooltipValue: {
    color: color.textDefault,
    fontVariantNumeric: 'tabular-nums',
  },
})

function isFlowNode(value: unknown): value is RechartsSankeyNode & FlowNode {
  return isRecord(value) && typeof value.value === 'number' && typeof value.hidden === 'boolean'
}

function round(n: number) {
  return Math.round(n * 1000) / 1000
}

function layout(nodes: readonly SankeyChartNode[], links: readonly SankeyChartLink[]) {
  const indexByName = new Map(nodes.map((node, index) => [node.name, index]))
  return {
    nodes: nodes.map((node): FlowNode => ({ name: node.name, hidden: node.hidden === true })),
    links: links.flatMap((link) => {
      const source = indexByName.get(link.source)
      const target = indexByName.get(link.target)
      const drawn =
        source !== undefined &&
        target !== undefined &&
        source !== target &&
        Number.isFinite(link.value) &&
        link.value > 0
      return drawn ? [{ source, target, value: link.value }] : []
    }),
  }
}

function nodeShape(midline: number) {
  return function SankeyNodeShape({ x, width, height, payload }: SankeyNodeProps) {
    if (!isFlowNode(payload) || !(payload.value > 0) || !(height > 0) || payload.hidden) return null
    return (
      <rect
        data-slot="sankey-node"
        x={round(x)}
        y={round(midline - height / 2)}
        width={round(width)}
        height={round(height)}
        rx={round(Math.min(3, width / 2, height / 2))}
        fill="currentColor"
      />
    )
  }
}

function linkShape(midline: number) {
  return function SankeyLinkShape(props: SankeyLinkProps) {
    const { source, target } = props.payload
    if (!isFlowNode(source) || !isFlowNode(target) || target.hidden) {
      return <g data-slot="sankey-link" />
    }
    const { sourceX, sourceControlX, targetX, targetControlX } = props
    const sourceTop = midline - source.dy / 2
    const sourceBottom = midline + source.dy / 2
    const targetTop = midline - target.dy / 2
    const targetBottom = midline + target.dy / 2
    const d = [
      `M${round(sourceX)},${round(sourceTop)}`,
      `C${round(sourceControlX)},${round(sourceTop)} ${round(targetControlX)},${round(targetTop)} ${round(targetX)},${round(targetTop)}`,
      `L${round(targetX)},${round(targetBottom)}`,
      `C${round(targetControlX)},${round(targetBottom)} ${round(sourceControlX)},${round(sourceBottom)} ${round(sourceX)},${round(sourceBottom)}`,
      'Z',
    ].join(' ')
    return (
      <path
        data-slot="sankey-link"
        d={d}
        fill="currentColor"
        stroke="none"
        {...stylex.props(styles.link)}
      />
    )
  }
}

function FlowTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: readonly TooltipPayloadEntry[]
}) {
  const item = payload?.find((entry) => entry.type !== 'none' && entry.value !== undefined)
  if (!active || item === undefined) return null
  const raw = isRecord(item.payload) ? item.payload : undefined
  const source = isFlowNode(raw?.source) ? raw.source : undefined
  const target = isFlowNode(raw?.target) ? raw.target : undefined
  const label =
    source !== undefined && target !== undefined
      ? `${source.name} → ${target.name}`
      : String(raw?.name ?? item.name)
  return (
    <div data-slot="chart-tooltip" {...stylex.props(styles.tooltip)}>
      <span aria-hidden="true" {...stylex.props(styles.tooltipSwatch)} />
      <span {...stylex.props(styles.tooltipLabel)}>{label}</span>
      <span {...stylex.props(styles.tooltipValue)}>{formatNumber(Number(item.value))}</span>
    </div>
  )
}

export function SankeyChart({
  nodes,
  links,
  height,
}: {
  nodes: readonly SankeyChartNode[]
  links: readonly SankeyChartLink[]
  height: number
}) {
  const data = React.useMemo(() => layout(nodes, links), [nodes, links])
  const node = React.useMemo(() => nodeShape(height / 2), [height])
  const link = React.useMemo(() => linkShape(height / 2), [height])
  return (
    <div data-slot="sankey-chart" aria-hidden="true" {...stylex.props(styles.root)}>
      <ResponsiveContainer initialDimension={initialDimension}>
        <Sankey
          data={data}
          nodeWidth={nodeWidth}
          nodePadding={0}
          linkCurvature={0.5}
          margin={MARGIN}
          node={node}
          link={link}
        >
          <Tooltip cursor={false} content={<FlowTooltip />} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
