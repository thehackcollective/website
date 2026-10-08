import * as stylex from '@stylexjs/stylex'

import { CountUp } from '@/components/count-up'
import { Reveal } from '@/components/reveal'
import { statsStyles } from '@/components/stats-section.stylex'
import { STATS } from '@/content'

export function StatsSection() {
  return (
    <section id="numbers" {...stylex.props(statsStyles.section)}>
      <Reveal>
        <h2 {...stylex.props(statsStyles.heading)}>By the numbers.</h2>
      </Reveal>

      <div {...stylex.props(statsStyles.grid)}>
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 0.06}
            className={stylex.props(statsStyles.cell, i % 2 === 1 && statsStyles.cellDivider).className}
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
