import * as stylex from '@stylexjs/stylex'

import { partnersStyles } from '@/components/partners-section.stylex'
import { PARTNERS } from '@/content'

export function PartnersSection() {
  return (
    <section id="partners" {...stylex.props(partnersStyles.section)}>
      <h2 {...stylex.props(partnersStyles.heading)}>Partners.</h2>

      <div {...stylex.props(partnersStyles.list)}>
        {PARTNERS.map((partner, i) => (
          <div
            key={partner.name}
            {...stylex.props(partnersStyles.row, i === 0 && partnersStyles.rowFirst)}
          >
            <span {...stylex.props(partnersStyles.label)}>{partner.name}</span>
            <span {...stylex.props(partnersStyles.value)}>{partner.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
