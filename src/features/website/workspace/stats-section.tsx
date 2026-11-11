import * as stylex from '@stylexjs/stylex'

import { CountUp } from '@/components/ui/count-up'
import { DiaHeading } from '@/components/ui/dia-text'
import { Reveal } from '@/components/ui/reveal'
import { STATS } from '@/features/website/workspace/content'
import { sectionHeadingStyles } from '@/features/website/workspace/section-heading.stylex'
import { statsStyles } from '@/features/website/workspace/stats-section.stylex'

export function StatsSection() {
  return (
    <section id="numbers" {...stylex.props(statsStyles.section)}>
      <DiaHeading className={stylex.props(sectionHeadingStyles.heading).className}>
        By the numbers.
      </DiaHeading>

      <div {...stylex.props(statsStyles.grid)}>
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.06}
            className={stylex.props(statsStyles.cell).className}
          >
            <CountUp value={stat.value} className={stylex.props(statsStyles.value).className} />
            <span {...stylex.props(statsStyles.label)}>{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
