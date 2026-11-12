import { AreaSparkline } from '@/ui/area-sparkline'
import { BarList } from '@/ui/bar-list'
import { BarChart } from '@/ui/chart-bar'
import { RingChart } from '@/ui/chart-ring'
import { ChartSkeleton } from '@/ui/chart-skeleton'
import type { Series } from '@/ui/chart-types'
import { AreaChart, LineChart } from '@/ui/chart-xy'
import { Figure } from '@/ui/figure'
import { MetricTile, MetricTileGrid } from '@/ui/metric-tile'
import { Section } from '@/ui/page'
import { Sparkline } from '@/ui/sparkline'
import { Stat, StatStrip } from '@/ui/stat-strip'

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

const growth = months.map((month, i) => ({
  month,
  members: 300 + i * 110 + (i % 3) * 20,
  target: 320 + i * 100,
}))

const growthSeries: Series[] = [
  { key: 'members', label: 'Members' },
  { key: 'target', label: 'Target', role: 'compare' },
]

const signups = months.map((month, i) => ({
  month,
  whatsapp: 40 + i * 8,
  luma: 20 + (i % 4) * 6,
}))

const signupSeries: Series[] = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'luma', label: 'Luma', role: 'series2' },
]

export function ShowcaseCharts() {
  return (
    <>
      <Section span={8} heading="Line" caption="Direct labels, the compare series is dashed">
        <Figure caption="Members against target">
          <LineChart
            data={growth}
            series={growthSeries}
            xKey="month"
            ariaLabel="Members against target"
          />
        </Figure>
      </Section>
      <Section span={4} heading="Ring">
        <Figure caption="Seats filled" height="md">
          <RingChart
            value={92}
            total={120}
            label="77%"
            sublabel="92 of 120"
            ariaLabel="92 of 120 seats filled"
          />
        </Figure>
      </Section>
      <Section span={6} heading="Area">
        <Figure caption="Sign-ups by channel" height="sm">
          <AreaChart
            data={signups}
            series={signupSeries}
            xKey="month"
            ariaLabel="Sign-ups by channel"
          />
        </Figure>
      </Section>
      <Section span={6} heading="Bars">
        <Figure caption="Sign-ups by channel" height="sm">
          <BarChart
            data={signups}
            series={signupSeries}
            xKey="month"
            ariaLabel="Sign-ups by channel, bars"
          />
        </Figure>
      </Section>
      <Section span={6} heading="Bar list">
        <BarList
          items={[
            { id: 'ucl', label: 'UCL', value: 420 },
            { id: 'imperial', label: 'Imperial', value: 310 },
            { id: 'kcl', label: "King's", value: 180 },
          ]}
        />
      </Section>
      <Section span={6} heading="Chart skeleton">
        <Figure caption="Plot placeholder" height="sm">
          <ChartSkeleton />
        </Figure>
      </Section>
      <Section heading="Stat strip" caption="Hover a stat with a trend to see its sparkline">
        <StatStrip>
          <Stat label="Members" value="1,100+" trend={[300, 520, 700, 880, 1100]} />
          <Stat label="Luma subscribers" value="450+" detail="Calendar" />
          <Stat label="Hackathons listed" value="38" tone="positive" />
        </StatStrip>
        <Sparkline values={[3, 5, 4, 8, 7, 9, 12]} label="Weekly joins" />
        <AreaSparkline data={[4, 6, null, 9, 12]} tone="brand" label="Event sign-ups" />
      </Section>
      <Section heading="Metric tiles" caption="Populated, sparse and unavailable">
        <MetricTileGrid>
          <MetricTile
            label="New members"
            tone="chart1"
            state={{
              kind: 'value',
              display: '48',
              series: [3, 5, 4, 8, 7, 9, 12],
              delta: '+9',
              note: 'on last month',
            }}
          />
          <MetricTile
            label="Events"
            tone="chart2"
            state={{ kind: 'value', display: '1', series: [1] }}
          />
          <MetricTile
            label="Sponsors"
            tone="neutral"
            state={{ kind: 'unavailable', reason: 'The CRM brings sponsor data next' }}
          />
        </MetricTileGrid>
      </Section>
    </>
  )
}
