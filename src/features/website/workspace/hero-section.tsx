import * as stylex from "@stylexjs/stylex";

import { HeroFigure } from "@/features/website/workspace/hero-figure";
import { heroStyles } from "@/features/website/workspace/hero-section.stylex";
import { buttonStyles } from "@/features/website/workspace/button.stylex";
import {
  StaggerReveal,
  StaggerRevealHeadline,
  StaggerRevealItem,
} from "@/components/ui/stagger-reveal";
import { LINKS } from "@/features/website/workspace/content";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      {...stylex.props(heroStyles.section)}
    >
      <div {...stylex.props(heroStyles.wrapper)}>
        <StaggerReveal className={stylex.props(heroStyles.content).className}>
          <StaggerRevealHeadline
            id="hero-heading"
            className={stylex.props(heroStyles.heading).className}
            ariaLabel="The home of hackathon enthusiasts."
          >
            {"The home of hackathon enthusiasts."}
          </StaggerRevealHeadline>

          <StaggerRevealItem
            as="p"
            className={stylex.props(heroStyles.subheading).className}
          >
            1,100+ builders, one WhatsApp group, every London hackathon on one
            calendar.
          </StaggerRevealItem>

          <StaggerRevealItem
            className={stylex.props(heroStyles.actions).className}
          >
            <a
              href={LINKS.luma}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(
                buttonStyles.buttonBase,
                buttonStyles.buttonLg,
                buttonStyles.buttonPrimary,
              )}
            >
              Follow our Luma calendar
            </a>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(
                buttonStyles.buttonBase,
                buttonStyles.buttonLg,
                buttonStyles.buttonSecondary,
              )}
            >
              Join the WhatsApp
            </a>
          </StaggerRevealItem>
        </StaggerReveal>
        <div {...stylex.props(heroStyles.figure)}>
          <HeroFigure />
        </div>
      </div>
    </section>
  );
}
