import * as stylex from '@stylexjs/stylex'

import { DiaHeading } from '@/components/ui/dia-text'
import { Reveal } from '@/components/ui/reveal'
import { buttonStyles } from '@/features/website/workspace/button.stylex'
import { hackStyles } from '@/features/website/workspace/hack-section.stylex'
import { HACK, LINKS } from '@/features/website/workspace/content'

export function HackSection() {
  return (
    <section id="hack" {...stylex.props(hackStyles.section)}>
      <div {...stylex.props(hackStyles.intro)}>
        <div {...stylex.props(hackStyles.headingBlock)}>
          <DiaHeading
            className={stylex.props(hackStyles.heading).className}
          >
            {HACK.title}
          </DiaHeading>
          <Reveal>
            <p {...stylex.props(hackStyles.body)}>
              An evening hackathon where Grok Bot holds the community context
              and Cursor turns it into code.
            </p>
          </Reveal>
          <Reveal>
            <p {...stylex.props(hackStyles.body)}>
              The Hack Collective is a community partner with its own track on
              the night, and the top 5 teams demo live for 3 minutes each.
            </p>
          </Reveal>
          <div {...stylex.props(hackStyles.actions)}>
            <a
              href={LINKS.hack}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(
                buttonStyles.buttonBase,
                buttonStyles.buttonPrimary,
              )}
            >
              Request to join on Luma
            </a>
          </div>
        </div>

        <Reveal className={stylex.props(hackStyles.posterCol).className}>
          <picture>
            <source
              srcSet="/events/grok-bot-ldn-community-hack.webp"
              type="image/webp"
            />
            <img
              src="/events/grok-bot-ldn-community-hack.jpg"
              alt="Grok Bot LDN Community Hack poster for Thursday 22 October with the partner communities' mascots"
              width={816}
              height={810}
              loading="lazy"
              decoding="async"
              {...stylex.props(hackStyles.poster)}
            />
          </picture>
        </Reveal>
      </div>
    </section>
  )
}
