import * as stylex from '@stylexjs/stylex'
import { space } from '@/tokens/token-consts.stylex'
import { seriesSwatch } from '@/ui/chart-series.stylex'
import { chartStyles } from '@/ui/chart-shared.stylex'
import { roleOf, type Series } from '@/ui/chart-types'

const styles = stylex.create({
  legend: {
    display: 'flex',
    gap: space.md,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})

export function SeriesLegend({ series }: { series: Series[] }) {
  return (
    <div aria-hidden {...stylex.props(styles.legend)}>
      {series.map((s) => (
        <span {...stylex.props(chartStyles.swatchLabel)} key={s.key}>
          <span {...stylex.props(chartStyles.swatch, seriesSwatch[roleOf(s)])} />
          {s.label}
        </span>
      ))}
    </div>
  )
}
