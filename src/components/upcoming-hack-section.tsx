import * as stylex from '@stylexjs/stylex'

import { hackStyles } from '@/components/upcoming-hack-section.stylex'
import { buttonStyles } from '@/components/button.stylex'
import { HACK, LINKS } from '@/content'

export function UpcomingHackSection() {
  return (
    <section id="hack" {...stylex.props(hackStyles.section)}>
      <div {...stylex.props(hackStyles.headingBlock)}>
        <p {...stylex.props(hackStyles.eyebrow)}>{HACK.eyebrow}</p>
        <h2 {...stylex.props(hackStyles.heading)}>{HACK.title}</h2>
        <p {...stylex.props(hackStyles.body)}>
          An evening hack presented by SpaceXAI with Cursor, where Grok Bot holds
          the community context and Cursor turns it into code.
        </p>
        <p {...stylex.props(hackStyles.body)}>
          Solo or teams of up to 3, the top 5 demo live for 3 minutes each,
          venue TBA.
        </p>
      </div>

      <div {...stylex.props(hackStyles.itemList)}>
        {HACK.tracks.map((track, i) => (
          <div
            key={track.name}
            {...stylex.props(hackStyles.item, i === 0 && hackStyles.itemFirst)}
          >
            <div {...stylex.props(hackStyles.itemHeader)}>
              <p {...stylex.props(hackStyles.itemBody)}>
                <span {...stylex.props(hackStyles.itemName)}>{track.name}</span>{' '}
                {track.description}
              </p>
              <span {...stylex.props(hackStyles.itemNumber)}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div {...stylex.props(hackStyles.actions)}>
        <a
          href={LINKS.hackLuma}
          target="_blank"
          rel="noopener noreferrer"
          {...stylex.props(buttonStyles.buttonBase, buttonStyles.buttonPrimary)}
        >
          Request to join on Luma
        </a>
      </div>
    </section>
  )
}
