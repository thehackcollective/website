import * as stylex from '@stylexjs/stylex'

import { heroStyles } from '@/features/website/workspace/hero-section.stylex'
import { buttonStyles } from '@/features/website/workspace/button.stylex'
import {
  StaggerReveal,
  StaggerRevealHeadline,
  StaggerRevealItem,
} from '@/components/ui/stagger-reveal'
import { LINKS } from '@/features/website/workspace/content'

export function HeroSection() {
  return (
    <section {...stylex.props(heroStyles.section)}>
      <StaggerReveal className={stylex.props(heroStyles.content).className}>
        <StaggerRevealHeadline
          id="hero-heading"
          className={stylex.props(heroStyles.heading).className}
          ariaLabel="London's hackathon community."
        >
          {"London's hackathon community."}
        </StaggerRevealHeadline>

        <StaggerRevealItem
          as="p"
          className={stylex.props(heroStyles.subheading).className}
        >
          1,000+ builders, one WhatsApp group, every London hackathon on one
          calendar.
        </StaggerRevealItem>

        <StaggerRevealItem className={stylex.props(heroStyles.actions).className}>
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(buttonStyles.buttonBase, buttonStyles.buttonPrimary)}
          >
            Join the WhatsApp
          </a>
          <a
            href={LINKS.luma}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(buttonStyles.buttonBase, buttonStyles.buttonSecondary)}
          >
            Luma calendar
          </a>
        </StaggerRevealItem>
      </StaggerReveal>
    </section>
  )
}
