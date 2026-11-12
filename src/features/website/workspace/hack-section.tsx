import * as stylex from '@stylexjs/stylex'

import { DiaHeading } from '@/components/ui/dia-text'
import { Reveal } from '@/components/ui/reveal'
import { type HackEvent, PAST_EVENTS, UPCOMING_EVENTS } from '@/features/website/workspace/content'
import { hackStyles } from '@/features/website/workspace/hack-section.stylex'
import { sectionHeadingStyles } from '@/features/website/workspace/section-heading.stylex'

function EventRow({ event, past, index }: { event: HackEvent; past: boolean; index: number }) {
  return (
    <Reveal delay={index * 0.06} className={stylex.props(hackStyles.row).className}>
      <div {...stylex.props(hackStyles.when)}>
        <p {...stylex.props(hackStyles.date)}>{past ? `Past · ${event.date}` : event.date}</p>
        <p {...stylex.props(hackStyles.meta)}>{event.place}</p>
      </div>
      <div {...stylex.props(hackStyles.detail)}>
        <p {...stylex.props(hackStyles.name, past && hackStyles.namePast)}>{event.name}</p>
        <p {...stylex.props(hackStyles.body)}>{event.about}</p>
        <p {...stylex.props(hackStyles.meta)}>{event.role}</p>
      </div>
      <a
        href={event.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${event.name} on Luma`}
        {...stylex.props(hackStyles.link)}
      >
        See on Luma
      </a>
    </Reveal>
  )
}

export function HackSection() {
  return (
    <section id="hack" {...stylex.props(hackStyles.section)}>
      <DiaHeading
        className={stylex.props(sectionHeadingStyles.heading, hackStyles.headingFlush).className}
      >
        Hackathons we are part of.
      </DiaHeading>
      <ul {...stylex.props(hackStyles.list)}>
        {UPCOMING_EVENTS.map((event, index) => (
          <li key={event.href} {...stylex.props(hackStyles.item)}>
            <EventRow event={event} past={false} index={index} />
          </li>
        ))}
        {PAST_EVENTS.map((event, index) => (
          <li key={event.href} {...stylex.props(hackStyles.item)}>
            <EventRow event={event} past index={UPCOMING_EVENTS.length + index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
