import * as stylex from '@stylexjs/stylex'

import { Reveal } from '@/components/reveal'
import { partnersStyles } from '@/components/partners-section.stylex'
import { PARTNERS } from '@/content'

export function PartnersSection() {
  return (
    <section id="partners" {...stylex.props(partnersStyles.section)}>
      <Reveal>
        <h2 {...stylex.props(partnersStyles.heading)}>Partners.</h2>
      </Reveal>

      <div {...stylex.props(partnersStyles.list)}>
        {PARTNERS.map((partner, i) => (
          <Reveal
            key={partner.name}
            delay={i * 0.06}
            className={stylex.props(partnersStyles.row, i === 0 && partnersStyles.rowFirst).className}
          >
            <span {...stylex.props(partnersStyles.label)}>{partner.name}</span>
            <span {...stylex.props(partnersStyles.value)}>{partner.description}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
