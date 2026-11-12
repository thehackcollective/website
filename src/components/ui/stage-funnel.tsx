import * as stylex from '@stylexjs/stylex'
import { lazy, Suspense, useMemo } from 'react'
import { formatNumber } from '@/lib/format'
import { color, space, text } from '@/tokens/token-consts.stylex'
import { EmptyState, type EmptyStateAction } from '@/ui/empty-state'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'
import { type Tone, toneColor } from '@/ui/tone.stylex'

export interface FunnelStage {
  key: string
  label: string
  count: number
}

export interface FunnelFlow {
  from: string
  to: string
  count: number
}

const FUNNEL_HEIGHT = 176

const SankeyChart = lazy(() =>
  import('@/ui/sankey-chart').then((module) => ({ default: module.SankeyChart })),
)

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    minWidth: 0,
  },
  counts: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: text.leadingCaption,
    margin: 0,
  },
  count: {
    color: color.textDefault,
  },
  plot: {
    height: FUNNEL_HEIGHT,
  },
  stages: {
    display: 'flex',
    gap: space.sm,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  stageEnd: {
    alignItems: 'flex-end',
    textAlign: 'end',
  },
  stageLabel: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    overflowWrap: 'anywhere',
  },
  stageCount: {
    color: color.textDefault,
    fontSize: text.sizeHeading,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: text.weightRegular,
    lineHeight: text.leadingHeading,
  },
  stageShare: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: text.leadingCaption,
  },
})

function share(count: number, first: number) {
  return formatNumber(count / first, { format: 'percent' })
}

function reached(stages: readonly FunnelStage[], flows: readonly FunnelFlow[], index: number) {
  const from = stages[index]
  const to = stages[index + 1]
  if (from === undefined || to === undefined) return 0
  const flow = flows.find((item) => item.from === from.key && item.to === to.key)
  const count = flow === undefined ? to.count : flow.count
  return Math.max(0, Math.min(count, from.count, to.count))
}

function dropName(stage: FunnelStage) {
  return `drop:${stage.key}`
}

function funnelData(stages: readonly FunnelStage[], flows: readonly FunnelFlow[]) {
  const nodes = [
    ...stages.map((stage) => ({ name: stage.label })),
    ...stages.slice(0, -1).map((stage) => ({ name: dropName(stage), hidden: true })),
  ]
  const links = stages.flatMap((stage, index) => {
    const next = stages[index + 1]
    if (next === undefined) return []
    const onward = reached(stages, flows, index)
    return [
      { source: stage.label, target: next.label, value: onward },
      { source: stage.label, target: dropName(stage), value: stage.count - onward },
    ]
  })
  return { nodes, links }
}

function Flow({
  stages,
  flows,
  tone,
}: {
  stages: readonly FunnelStage[]
  flows: readonly FunnelFlow[]
  tone: Tone
}) {
  const { nodes, links } = useMemo(() => funnelData(stages, flows), [stages, flows])
  return (
    <div {...stylex.props(styles.plot, toneColor[tone])}>
      <Suspense fallback={null}>
        <SankeyChart nodes={nodes} links={links} height={FUNNEL_HEIGHT} />
      </Suspense>
    </div>
  )
}

function TextTable({
  label,
  stages,
  flows,
}: {
  label: string
  stages: readonly FunnelStage[]
  flows: readonly FunnelFlow[]
}) {
  const first = stages[0]?.count ?? 0
  const name = (key: string) => stages.find((stage) => stage.key === key)?.label ?? key
  return (
    <table {...stylex.props(primitiveStyles.srOnly)}>
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Stage</th>
          <th scope="col">Count</th>
          <th scope="col">Share of first stage</th>
        </tr>
      </thead>
      <tbody>
        {stages.map((stage) => (
          <tr key={stage.key}>
            <th scope="row">{stage.label}</th>
            <td>{formatNumber(stage.count)}</td>
            <td>{share(stage.count, first)}</td>
          </tr>
        ))}
        {flows.map((flow) => (
          <tr key={`${flow.from}-${flow.to}`}>
            <th scope="row">{`${name(flow.from)} to ${name(flow.to)}`}</th>
            <td>{formatNumber(flow.count)}</td>
            <td>{share(flow.count, first)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function StageFunnel({
  label,
  stages,
  flows = [],
  tone,
  enough,
  emptyAction,
}: {
  label: string
  stages: readonly FunnelStage[]
  flows?: readonly FunnelFlow[]
  tone: Tone
  enough: boolean
  emptyAction: EmptyStateAction
}) {
  const first = stages[0]?.count ?? 0
  if (first <= 0) {
    return (
      <EmptyState
        kind="empty"
        size="compact"
        title="Nothing in this period"
        description="Stages show here once the first entry lands."
        primaryAction={emptyAction}
      />
    )
  }
  return (
    <div data-slot="stage-funnel" {...stylex.props(styles.root)}>
      {enough ? (
        <>
          <div aria-hidden="true" {...stylex.props(styles.stages)}>
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                {...stylex.props(styles.stage, index === stages.length - 1 && styles.stageEnd)}
              >
                <span {...stylex.props(styles.stageLabel)}>{stage.label}</span>
                <span {...stylex.props(styles.stageCount)}>{formatNumber(stage.count)}</span>
                <span {...stylex.props(styles.stageShare)}>{share(stage.count, first)}</span>
              </div>
            ))}
          </div>
          <Flow stages={stages} flows={flows} tone={tone} />
        </>
      ) : (
        <p aria-hidden="true" {...stylex.props(styles.counts)}>
          {stages.map((stage, index) => (
            <span key={stage.key}>
              {index > 0 && ' · '}
              <span {...stylex.props(styles.count)}>{formatNumber(stage.count)}</span> {stage.label}
            </span>
          ))}
        </p>
      )}
      <TextTable label={label} stages={stages} flows={flows} />
    </div>
  )
}
