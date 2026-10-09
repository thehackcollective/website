import * as stylex from '@stylexjs/stylex'

import { DiaHeading } from '@/components/ui/dia-text'
import { Reveal } from '@/components/ui/reveal'
import { buttonStyles } from '@/features/website/workspace/button.stylex'
import { hackStyles } from '@/features/website/workspace/hack-section.stylex'
import { HACK, LINKS } from '@/features/website/workspace/content'

export function HackSection() {
  return (
    <section id="hack" {...stylex.props(hackStyles.section)}>
      <div {...stylex.props(hackStyles.headingBlock)}>
        <p {...stylex.props(hackStyles.eyebrow)}>{HACK.eyebrow}</p>
        <DiaHeading
          className={stylex.props(hackStyles.heading).className}
        >
          {HACK.title}
        </DiaHeading>
        <Reveal>
          <p {...stylex.props(hackStyles.body)}>
            An evening hackathon where Grok Bot holds the community context and
            Cursor turns it into code.
          </p>
        </Reveal>
        <Reveal>
          <p {...stylex.props(hackStyles.body)}>
            The Hack Collective is a community partner with its own track on
            the night, and the top 5 teams demo live for 3 minutes each.
          </p>
        </Reveal>
      </div>

      <div {...stylex.props(hackStyles.itemList)}>
        {HACK.tracks.map((track, i) => (
          <Reveal
            key={track.name}
            delay={i * 0.06}
            className={
              stylex.props(
                hackStyles.item,
                i === 0 && hackStyles.itemFirst,
              ).className
            }
          >
            <div {...stylex.props(hackStyles.itemHeader)}>
              <p {...stylex.props(hackStyles.itemBody)}>
                <span {...stylex.props(hackStyles.itemName)}>
                  {track.name}
                </span>{' '}
                {track.description}
              </p>
              <span {...stylex.props(hackStyles.itemNumber)}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

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
    </section>
  )
}
