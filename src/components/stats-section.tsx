import * as stylex from '@stylexjs/stylex'

import { statsStyles } from '@/components/stats-section.stylex'
import { STATS } from '@/content'

export function StatsSection() {
  return (
    <section id="numbers" {...stylex.props(statsStyles.section)}>
      <h2 {...stylex.props(statsStyles.heading)}>By the numbers.</h2>

      <div {...stylex.props(statsStyles.grid)}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            {...stylex.props(statsStyles.cell, i % 2 === 1 && statsStyles.cellDivider)}
          >
            <span {...stylex.props(statsStyles.value)}>{stat.value}</span>
            <span {...stylex.props(statsStyles.label)}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
