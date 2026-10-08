import * as stylex from '@stylexjs/stylex'

import { Reveal } from '@/components/reveal'
import { joinStyles } from '@/components/join-section.stylex'
import { LINKS } from '@/content'

const JOIN_ROWS = [
  { label: 'WhatsApp', value: 'chat.whatsapp.com/EWCPnquUzXD9uppsSuQFVk', href: LINKS.whatsapp },
  { label: 'Luma', value: 'luma.com/thehackcollective', href: LINKS.luma },
  { label: 'Submit an event', value: 'luma.com/thehackcollective', href: LINKS.luma },
  { label: 'Partner with us', value: 'lelouis.lnv@gmail.com', href: LINKS.email },
]

export function JoinSection() {
  return (
    <section id="join" {...stylex.props(joinStyles.section)}>
      <div {...stylex.props(joinStyles.content)}>
        <Reveal className={stylex.props(joinStyles.copy).className}>
          <h2 {...stylex.props(joinStyles.heading)}>Join the collective.</h2>
          <p {...stylex.props(joinStyles.body)}>
            Founded in London in September 2025 by UCL students, run on WhatsApp
            and Luma.
          </p>
        </Reveal>

        <div {...stylex.props(joinStyles.contactList)}>
          {JOIN_ROWS.map((row, i) => (
            <Reveal
              key={row.label}
              delay={i * 0.06}
              className={
                stylex.props(
                  joinStyles.contactRow,
                  i === 0 && joinStyles.contactRowFirst,
                ).className
              }
            >
              <span {...stylex.props(joinStyles.contactLabel)}>{row.label}</span>
              <a
                href={row.href}
                target={row.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={row.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                {...stylex.props(joinStyles.contactValue, joinStyles.contactLink)}
              >
                {row.value}
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <div {...stylex.props(joinStyles.footer)}>
        &copy; 2026 The Hack Collective. London.
      </div>
    </section>
  )
}
