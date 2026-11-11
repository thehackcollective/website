import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { Field } from '@/ui/field'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { Input, Textarea } from '@/ui/input'
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@/ui/menu'
import { Section } from '@/ui/page'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/ui/popover'
import { RadioGroup, RadioRow } from '@/ui/radio-group'
import { SearchField } from '@/ui/search-field'
import { Segmented } from '@/ui/segmented'
import { OptionSelect } from '@/ui/select'
import { SizeProvider } from '@/ui/size-provider'
import { Switch } from '@/ui/switch'
import { Caption } from '@/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const ranges = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'term', label: 'Term' },
]

const tracks = [
  { value: 'ai', label: 'AI agents' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'hardware', label: 'Hardware', disabled: true },
] as const

type Track = (typeof tracks)[number]['value']

function FieldStates() {
  return (
    <Section span={6} heading="Fields" caption="Rest, invalid, read-only and disabled">
      <Field label="Member name" htmlFor="showcase-field-rest">
        <Input id="showcase-field-rest" placeholder="Jordan Lee" />
      </Field>
      <Field label="Email" htmlFor="showcase-field-invalid" error="Enter an email address">
        <Input id="showcase-field-invalid" defaultValue="jordan@" aria-invalid />
      </Field>
      <Field label="University" htmlFor="showcase-field-read-only">
        <Input id="showcase-field-read-only" defaultValue="UCL" readOnly />
      </Field>
      <Field label="Team size" htmlFor="showcase-field-disabled">
        <Input id="showcase-field-disabled" defaultValue="4" disabled />
      </Field>
      <Field label="Note" htmlFor="showcase-field-note">
        <Textarea id="showcase-field-note" placeholder="Add a note for the team" />
      </Field>
      <SearchField aria-label="Search members" placeholder="Search members" />
    </Section>
  )
}

function ToggleStates() {
  return (
    <Section span={6} heading="Toggles" caption="Checkbox, switch and tooltip states">
      <div {...stylex.props(styles.row)}>
        <Checkbox aria-label="Unchecked" />
        <Checkbox defaultChecked aria-label="Checked" />
        <Checkbox indeterminate aria-label="Indeterminate" />
        <Checkbox disabled aria-label="Disabled" />
      </div>
      <div {...stylex.props(styles.row)}>
        <Switch aria-label="Off" />
        <Switch defaultChecked aria-label="On" />
        <Switch disabled aria-label="Off, disabled" />
        <Switch size="sm" defaultChecked aria-label="On, small" />
      </div>
      <Tooltip>
        <TooltipTrigger aria-label="More actions" render={<Button variant="ghost" size="icon" />}>
          <Icon icon={icons.more} />
        </TooltipTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>
    </Section>
  )
}

export function ShowcaseControls() {
  const [range, setRange] = useState('month')
  const [plan, setPlan] = useState('solo')
  const [track, setTrack] = useState<Track | null>(null)
  const [picked, setPicked] = useState('Nothing yet')

  return (
    <>
      <FieldStates />
      <ToggleStates />
      <Section span={6} heading="Segmented and select" caption="Default and compact sizes">
        <Segmented options={ranges} value={range} onChange={setRange} aria-label="Range" />
        <SizeProvider size="compact">
          <Segmented
            options={ranges}
            value={range}
            onChange={setRange}
            aria-label="Range, compact"
          />
        </SizeProvider>
        <OptionSelect
          items={tracks}
          value={track}
          label="Track"
          placeholder="Pick a track"
          onChange={setTrack}
        />
      </Section>
      <Section span={6} heading="Radio group">
        <RadioGroup value={plan} onValueChange={setPlan} name="plan">
          <RadioRow value="solo" title="Hack solo" />
          <RadioRow
            value="team"
            title="Hack in a team"
            meta={<Caption>Up to four people</Caption>}
          />
          <RadioRow value="mentor" title="Mentor" disabled />
        </RadioGroup>
      </Section>
      <Section heading="Menu and popover" caption={`Menu picked: ${picked}`}>
        <div {...stylex.props(styles.row)}>
          <Menu trigger={<Button variant="outline">Open menu</Button>}>
            <MenuLabel>Member</MenuLabel>
            <MenuItem onClick={() => setPicked('Rename')} meta="R">
              Rename
            </MenuItem>
            <MenuItem onClick={() => setPicked('Duplicate')}>Duplicate</MenuItem>
            <MenuItem disabled>Transfer</MenuItem>
            <MenuSeparator />
            <MenuItem tone="negative" onClick={() => setPicked('Archive')}>
              Archive
            </MenuItem>
          </Menu>
          <Popover>
            <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
            <PopoverContent>
              <PopoverTitle>Next hackathon</PopoverTitle>
              <PopoverDescription>The calendar lists every London hackathon.</PopoverDescription>
            </PopoverContent>
          </Popover>
        </div>
      </Section>
    </>
  )
}
