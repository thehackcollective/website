import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import * as stylex from '@stylexjs/stylex'
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/ui/accordion'
import { BrandLockup } from '@/ui/brand-lockup'
import { Breadcrumbs } from '@/ui/breadcrumbs'
import { Button } from '@/ui/button'
import { Card, CardContent, SectionCard } from '@/ui/card'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/ui/collapsible'
import { confirmationCardStyles } from '@/ui/confirmation-card.stylex'
import { featureHeroStyles } from '@/ui/feature-hero.stylex'
import { icons } from '@/ui/icons'
import { Section } from '@/ui/page'
import { pageLayoutStyles } from '@/ui/page-layout.stylex'
import { SearchField } from '@/ui/search-field'
import { Separator } from '@/ui/separator'
import { Body, Caption, Display, Title, UiText } from '@/ui/text'
import { Toolbar } from '@/ui/toolbar'

const faqs = [
  {
    value: 'who',
    question: 'Who can join a hackathon?',
    answer: 'Any student or builder in London can join, and most events take teams of up to four.',
  },
  {
    value: 'cost',
    question: 'Do events cost anything?',
    answer: 'Every hackathon on the calendar is free to enter.',
  },
  {
    value: 'calendar',
    question: 'Where is the calendar?',
    answer: 'The Luma calendar lists every London hackathon the community knows about.',
  },
]

function Disclosures() {
  return (
    <Section span={6} heading="Accordion and collapsible">
      <Accordion variant="card" defaultValue={['who']}>
        {faqs.map((faq) => (
          <AccordionItem key={faq.value} value={faq.value}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionPanel>{faq.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Collapsible>
        <CollapsibleTrigger>Judging criteria</CollapsibleTrigger>
        <CollapsiblePanel>
          Teams are judged on the idea, the build and the demo, each out of ten.
        </CollapsiblePanel>
      </Collapsible>
    </Section>
  )
}

function Surfaces() {
  return (
    <Section span={6} heading="Cards" caption="Card, compact card and section card">
      <Card>
        <CardContent>
          <UiText>Grok Bot Community Engineering London Hackathon</UiText>
          <Caption>Thu 22 Oct 2026, 6:00 PM, London</Caption>
        </CardContent>
      </Card>
      <Card density="sm">
        <CardContent density="sm">
          <Caption>The Hack Collective runs its own track at this event.</Caption>
        </CardContent>
      </Card>
      <SectionCard
        title="Sponsors"
        icon={icons.money}
        action={<Button variant="ghost">Add a sponsor</Button>}
      >
        <Body>Three sponsors have confirmed prizes for the autumn season.</Body>
      </SectionCard>
    </Section>
  )
}

function Typography() {
  return (
    <Section span={6} heading="Type" caption="Display, title, ui text, body and caption">
      <Display>1,100+ builders</Display>
      <Title>London hackathons</Title>
      <UiText>One WhatsApp group, every London hackathon on one calendar.</UiText>
      <Body>The community was founded in London in September 2025 by UCL students.</Body>
      <Caption>Updated after every event.</Caption>
    </Section>
  )
}

function Frames() {
  return (
    <Section span={6} heading="Frames" caption="Brand lockup, breadcrumbs, toolbar and hero row">
      <BrandLockup />
      <Breadcrumbs
        items={[
          { id: 'events', label: 'Events', href: '/design' },
          { id: 'season', label: 'Autumn 2026', href: '/design' },
          { id: 'event', label: 'Grok Bot hackathon' },
        ]}
      />
      <Toolbar
        label="Members"
        search={<SearchField aria-label="Search members" placeholder="Search members" />}
        status={<Caption>1,104 members</Caption>}
        actions={<Button variant="outline">Export</Button>}
      />
      <Separator />
      <div {...stylex.props(featureHeroStyles.hero)}>
        <BrandLockup />
        <div {...stylex.props(featureHeroStyles.heroText)}>
          <UiText>Members</UiText>
          <Caption>Everyone in the WhatsApp group and on the calendar.</Caption>
        </div>
      </div>
    </Section>
  )
}

function Confirmation() {
  return (
    <Section heading="Confirmation card" caption="The full-page card a link from an email opens">
      <div {...stylex.props(pageLayoutStyles.page)}>
        <div {...stylex.props(confirmationCardStyles.card)}>
          <UiText>Your seat at the Grok Bot hackathon is confirmed.</UiText>
          <div {...stylex.props(styles.row)}>
            <Button>Add to calendar</Button>
            <Button variant="ghost">Cancel my seat</Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function ShowcaseLayout() {
  return (
    <>
      <Disclosures />
      <Surfaces />
      <Typography />
      <Frames />
      <Confirmation />
    </>
  )
}
