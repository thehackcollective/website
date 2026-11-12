import { Button } from '@/ui/button'
import { type CalendarEvent, CalendarGrid } from '@/ui/calendar-grid'
import { durationLabel } from '@/ui/calendar-model'
import { Section } from '@/ui/page'
import { Caption } from '@/ui/text'

const hour = 3_600_000
const day = 24 * hour

function startOfToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

function sampleEvents(): CalendarEvent[] {
  const today = startOfToday()
  return [
    {
      id: 'kickoff',
      title: 'Grok Bot hackathon kickoff',
      start: today + 18 * hour,
      end: today + 20 * hour,
      tone: 'active',
    },
    {
      id: 'mentors',
      title: 'Mentor briefing',
      start: today + day + 12 * hour,
      end: today + day + 13 * hour,
      tone: 'positive',
    },
    {
      id: 'sponsor-call',
      title: 'Sponsor call, Northwind Cloud',
      start: today + day + 12 * hour + 30 * 60_000,
      end: today + day + 13 * hour + 30 * 60_000,
      tone: 'warning',
    },
    {
      id: 'judging',
      title: 'Judging',
      start: today + 2 * day + 15 * hour,
      end: today + 2 * day + 18 * hour,
      tone: 'neutral',
    },
    {
      id: 'retro',
      title: 'Organiser retro',
      start: today - day + 17 * hour,
      end: today - day + 18 * hour,
      tone: 'neutral',
      muted: true,
    },
  ]
}

export function ShowcaseCalendar() {
  return (
    <Section heading="Calendar" caption="Day, week and month views with overlapping events">
      <CalendarGrid
        label="Community calendar"
        events={sampleEvents()}
        details={(event, close) => (
          <>
            <Caption>{event.title}</Caption>
            <Caption>{durationLabel(event.end - event.start)}</Caption>
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          </>
        )}
      />
    </Section>
  )
}
