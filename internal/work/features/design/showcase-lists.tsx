import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import { showcaseListStyles as listStyles } from '@internal/work/features/design/showcase-lists.stylex'
import * as stylex from '@stylexjs/stylex'
import { Avatar } from '@/ui/avatar'
import { ButtonLink } from '@/ui/button'
import { DefinitionFact } from '@/ui/definition-fact'
import { ExternalLink } from '@/ui/external-link'
import { IconLabel } from '@/ui/icon-label'
import { icons } from '@/ui/icons'
import { Section } from '@/ui/page'
import { PhotoTile } from '@/ui/photo-tile'
import { RecordCell } from '@/ui/record-cell'
import { RowList, RowListItem } from '@/ui/row-list'
import { StatusDot } from '@/ui/status-dot'
import { type Step, StepList } from '@/ui/step-list'
import { Stepper } from '@/ui/stepper'
import { StatusChip, Strength, TagList } from '@/ui/table-cells'

const onboarding: Step[] = [
  { id: 'join', title: 'Join the WhatsApp group', state: 'done' },
  {
    id: 'calendar',
    title: 'Subscribe to the Luma calendar',
    detail: 'Every London hackathon in one feed',
    state: 'active',
    action: { label: 'Subscribe', onClick: () => undefined },
  },
  { id: 'team', title: 'Find a team for the next event', state: 'todo' },
]

const facts = [
  { label: 'Members', value: '1,100+' },
  { label: 'Luma subscribers', value: '450+' },
  { label: 'Founded', value: 'September 2025' },
]

function Rows() {
  return (
    <Section span={6} heading="Row list" caption="Linked rows, unread rows and row values">
      <RowList>
        <RowListItem
          title="Grok Bot Community Engineering London Hackathon"
          detail="Thu 22 Oct, 6:00 PM"
          value="120 seats"
          to="/design"
          active
        />
        <RowListItem title="Sponsor intro from Northwind Cloud" detail="2 hours ago" unread />
        <RowListItem
          title="Autumn judging rota"
          detail="Shared by Ada Park"
          value="Open"
          action={icons.forward}
          onClick={() => undefined}
        />
      </RowList>
    </Section>
  )
}

function Records() {
  return (
    <Section span={6} heading="Records" caption="Record cell, icon label and facts">
      <RecordCell
        leading={<Avatar name="Sam Okafor" />}
        title="Sam Okafor"
        detail="Imperial, 3 hackathons"
        trailing={<StatusDot tone="positive" label="Active" />}
      />
      <RecordCell
        leading={<PhotoTile alt="Venue photo" size="sm" fallbackIcon={icons.location} />}
        title="Bloomsbury venue"
        detail="Holds 150 builders"
      />
      <IconLabel icon={icons.calendar} iconLabel="Date">
        Thu 22 Oct 2026
      </IconLabel>
      <dl {...stylex.props(listStyles.facts)}>
        {facts.map((fact) => (
          <DefinitionFact
            key={fact.label}
            containerStyle={listStyles.fact}
            labelStyle={listStyles.factLabel}
            valueStyle={listStyles.factValue}
            label={fact.label}
            value={fact.value}
          />
        ))}
      </dl>
    </Section>
  )
}

function Statuses() {
  return (
    <Section span={6} heading="Status" caption="Dots, chips, strength and tag lists">
      <div {...stylex.props(styles.row)}>
        <StatusDot tone="neutral" label="Draft" />
        <StatusDot tone="active" label="Live" />
        <StatusDot tone="positive" label="Confirmed" />
        <StatusDot tone="warning" label="Waitlist" />
        <StatusDot tone="danger" label="Cancelled" />
      </div>
      <div {...stylex.props(styles.row)}>
        <StatusChip label="Checked in" tone="success" />
        <Strength label="Strong lead" tone="success" />
        <Strength label="Cold lead" tone="neutral" compact />
      </div>
      <TagList
        tags={[
          { label: 'AI agents', tone: 'cat1' },
          { label: 'Fintech', tone: 'cat2' },
          { label: 'Hardware', tone: 'cat3' },
          { label: 'First-timers', tone: 'neutral' },
        ]}
      />
    </Section>
  )
}

function Progression() {
  return (
    <Section span={6} heading="Steps" caption="Step list, stepper and links">
      <StepList steps={onboarding} />
      <Stepper at={1} count={3} name="Onboarding" />
      <div {...stylex.props(styles.row)}>
        <ExternalLink href="https://luma.com/thehackcollective">Luma calendar</ExternalLink>
        <ButtonLink href="https://luma.com/thehackcollective" variant="outline">
          Open the calendar
        </ButtonLink>
      </div>
    </Section>
  )
}

export function ShowcaseLists() {
  return (
    <>
      <Rows />
      <Records />
      <Statuses />
      <Progression />
    </>
  )
}
