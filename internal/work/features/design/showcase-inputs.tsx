import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import { showcaseInputStyles as inputStyles } from '@internal/work/features/design/showcase-inputs.stylex'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { controlButtonStyles } from '@/ui/control-button.stylex'
import { dialogControls } from '@/ui/dialog-controls.stylex'
import { FilterMiss } from '@/ui/empty-state'
import { Field } from '@/ui/field'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { Input } from '@/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group'
import { Menu, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem } from '@/ui/menu'
import { Section } from '@/ui/page'
import { Pressable } from '@/ui/pressable'
import { clearRefreshFailed, showRefreshFailed } from '@/ui/refresh-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Caption } from '@/ui/text'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/tooltip'

const roles = [
  { value: 'builder', label: 'Builder' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'judge', label: 'Judge' },
]

const reminders = [
  { id: 'week', label: 'A week before', detail: 'An email with the schedule' },
  { id: 'day', label: 'The day before', detail: 'A WhatsApp message with the venue' },
]

function Composed() {
  const [role, setRole] = useState<string | null>('builder')
  return (
    <Section span={6} heading="Input group and select" caption="Addons, file input and a select">
      <Field label="Luma link" htmlFor="showcase-luma-link">
        <InputGroup>
          <InputGroupAddon>luma.com/</InputGroupAddon>
          <InputGroupInput id="showcase-luma-link" placeholder="thehackcollective" />
        </InputGroup>
      </Field>
      <Field label="Team logo" htmlFor="showcase-team-logo">
        <Input id="showcase-team-logo" type="file" accept="image/*" />
      </Field>
      <Select items={roles} value={role} onValueChange={setRole}>
        <SelectTrigger aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Section>
  )
}

function MenuChoices() {
  const [sort, setSort] = useState('date')
  const [past, setPast] = useState(false)
  return (
    <Section span={6} heading="Menu choices" caption={`Sorted by ${sort}`}>
      <Menu trigger={<Button variant="outline">View options</Button>}>
        <MenuRadioGroup label="Sort events" value={sort} onValueChange={setSort}>
          <MenuRadioItem value="date">Date</MenuRadioItem>
          <MenuRadioItem value="seats" caption="Most seats first">
            Seats
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuCheckboxItem checked={past} onCheckedChange={setPast}>
          Show past events
        </MenuCheckboxItem>
      </Menu>
      <TooltipProvider delay={200}>
        <div {...stylex.props(styles.row)}>
          <Tooltip>
            <TooltipTrigger
              render={<Pressable surface="tile" style={[controlButtonStyles.base]} />}
            >
              <Icon icon={icons.calendar} size="sm" />
              Calendar
            </TooltipTrigger>
            <TooltipContent>The shared tooltip delay comes from the provider</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            onClick={() =>
              showRefreshFailed({
                id: 'design-refresh',
                message: 'Members did not refresh.',
                onRetry: () => clearRefreshFailed('design-refresh'),
              })
            }
          >
            Refresh failed
          </Button>
          <Button variant="ghost" onClick={() => clearRefreshFailed('design-refresh')}>
            Dismiss it
          </Button>
        </div>
      </TooltipProvider>
    </Section>
  )
}

function DialogOptions() {
  return (
    <Section span={6} heading="Dialog options" caption="The option list inside a settings dialog">
      <div {...stylex.props(dialogControls.list)}>
        {reminders.map((reminder) => (
          <label key={reminder.id} {...stylex.props(dialogControls.optionRow)}>
            <Checkbox defaultChecked={reminder.id === 'day'} aria-label={reminder.label} />
            <span {...stylex.props(dialogControls.optionDetails)}>
              <span {...stylex.props(dialogControls.optionLabel)}>{reminder.label}</span>
              <span {...stylex.props(dialogControls.optionDescription)}>{reminder.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <div {...stylex.props(dialogControls.footer)}>
        <p {...stylex.props(dialogControls.footerCount)}>1 of 2 reminders on</p>
        <p {...stylex.props(dialogControls.error)}>Pick a reminder to keep members on time.</p>
      </div>
      <FilterMiss title="No events this week" onClear={() => undefined} clears="search" />
    </Section>
  )
}

function IconJobs() {
  return (
    <Section span={6} heading="Icons" caption="Every icon job in the kit">
      <ul {...stylex.props(inputStyles.icons)}>
        {Object.entries(icons).map(([job, icon]) => (
          <li key={job} title={job} {...stylex.props(inputStyles.icon)}>
            <Icon icon={icon} />
            <Caption>{job}</Caption>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function ShowcaseInputs() {
  return (
    <>
      <Composed />
      <MenuChoices />
      <DialogOptions />
      <IconJobs />
    </>
  )
}
