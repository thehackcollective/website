import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Button } from '@/ui/button'
import { DistributionBar } from '@/ui/distribution-bar'
import { Metric } from '@/ui/metric'
import { MetricTiles } from '@/ui/metric-tile'
import { Section } from '@/ui/page'
import { Progress } from '@/ui/progress'
import { SkeletonRows, SkeletonSwap } from '@/ui/skeleton'
import { StageFunnel } from '@/ui/stage-funnel'
import { SuccessBurst } from '@/ui/success-burst'
import { TablePagination } from '@/ui/table'
import { Caption } from '@/ui/text'
import { TextShimmerWave } from '@/ui/text-shimmer-wave'
import { TextSwap } from '@/ui/text-swap'
import { TickBar } from '@/ui/tick-bar'

const funnel = [
  { key: 'registered', label: 'Registered', count: 240 },
  { key: 'accepted', label: 'Accepted', count: 150 },
  { key: 'checked-in', label: 'Checked in', count: 118 },
  { key: 'submitted', label: 'Submitted', count: 31 },
]

const funnelFlows = [
  { from: 'registered', to: 'accepted', count: 150 },
  { from: 'accepted', to: 'checked-in', count: 118 },
  { from: 'checked-in', to: 'submitted', count: 31 },
]

const phases = ['Registration open', 'Hacking', 'Judging', 'Winners announced']

function Meters() {
  return (
    <Section span={6} heading="Meters" caption="Progress, tick bar and metric">
      <Progress value={92} max={120} label="Seats filled" />
      <TickBar value={31} max={40} aria-label="31 of 40 teams submitted" />
      <TickBar value={38} max={40} tone="warning" aria-label="38 of 40 mentor slots booked" />
      <Metric
        label="Members"
        value="1,104"
        delta="+48"
        deltaTone="positive"
        context="since the last event"
      />
    </Section>
  )
}

function Shares() {
  return (
    <Section span={6} heading="Distribution and funnel">
      <DistributionBar
        label="Members by university"
        segments={[
          { name: 'UCL', value: 420 },
          { name: 'Imperial', value: 310 },
          { name: "King's", value: 180 },
          { name: 'Other', value: 194 },
        ]}
      />
      <StageFunnel
        label="Autumn hackathon"
        stages={funnel}
        flows={funnelFlows}
        tone="chart1"
        enough
        emptyAction={{ label: 'Open events', to: '/design' }}
      />
    </Section>
  )
}

function Loading() {
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(0)
  const [shown, setShown] = useState(10)
  return (
    <Section span={6} heading="Loading and motion" caption="Skeletons, shimmer, swap and burst">
      <SkeletonRows rows={3} />
      <SkeletonSwap loading={loading}>
        <Caption>118 builders checked in.</Caption>
      </SkeletonSwap>
      <TextShimmerWave>Matching mentors to teams</TextShimmerWave>
      <div {...stylex.props(styles.row)}>
        <Button variant="outline" onClick={() => setLoading((current) => !current)}>
          {loading ? 'Finish loading' : 'Load again'}
        </Button>
        <Button variant="outline" onClick={() => setPhase((current) => (current + 1) % 4)}>
          Next phase
        </Button>
        <TextSwap text={phases[phase] ?? 'Registration open'} />
        <SuccessBurst label="Team submitted" />
      </div>
      <TablePagination
        shownCount={shown}
        totalCount={38}
        onShowMore={() => setShown((current) => Math.min(38, current + 10))}
      />
    </Section>
  )
}

export function ShowcaseProgress() {
  return (
    <>
      <Meters />
      <Shares />
      <Loading />
      <Section span={6} heading="Metric tile row" caption="A shared note shows once">
        <MetricTiles
          tiles={[
            {
              id: 'sponsors',
              label: 'Sponsors',
              tone: 'chart3',
              state: { kind: 'value', display: '3', series: [1], note: 'Data starts this season' },
            },
            {
              id: 'mentors',
              label: 'Mentors',
              tone: 'chart4',
              state: { kind: 'value', display: '14', series: [9], note: 'Data starts this season' },
            },
          ]}
        />
      </Section>
    </>
  )
}
