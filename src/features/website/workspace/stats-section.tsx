import * as stylex from '@stylexjs/stylex'

import { CountUp } from '@/components/ui/count-up'
import { DiaHeading } from '@/components/ui/dia-text'
import { Reveal } from '@/components/ui/reveal'
import { statsStyles } from '@/features/website/workspace/stats-section.stylex'
import { STATS } from '@/features/website/workspace/content'

export function StatsSection() {
  return (
    <section id="numbers" {...stylex.props(statsStyles.section)}>
      <DiaHeading
        className={stylex.props(statsStyles.heading).className}
      >
        By the numbers.
      </DiaHeading>

      <div {...stylex.props(statsStyles.grid)}>
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.06}
            className={stylex.props(statsStyles.cell).className}
          >
            <CountUp
              value={stat.value}
              className={stylex.props(statsStyles.value).className}
            />
            <span {...stylex.props(statsStyles.label)}>{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
