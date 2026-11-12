import * as stylex from '@stylexjs/stylex'
import { AnimatePresence, m } from 'motion/react'
import { exitTween, spring } from '@/lib/motion'
import { color, radius, space, text } from '@/tokens/token-consts.stylex'
import { seriesSwatch } from '@/ui/chart-series.stylex'
import { chartStyles } from '@/ui/chart-shared.stylex'
import { type ChartDatum, cellValue, datumLabel, roleOf, type XYChartProps } from '@/ui/chart-types'

const TOOLTIP_WIDTH = 180
const GAP = 14

const styles = stylex.create({
  float: {
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    zIndex: 50,
  },
  card: {
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: radius.md,
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: text.fontSans,
    gap: space.xxs,
    paddingBlock: space.xs,
    paddingInline: space.sm,
    whiteSpace: 'nowrap',
  },
  title: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xs,
    justifyContent: 'space-between',
  },
  value: {
    color: color.textDefault,
    fontSize: text.sizeCaption,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: text.weightRegular,
    lineHeight: text.leadingCaption,
  },
})

function FloatCard({
  datum,
  x,
  y,
  containerWidth,
  series,
  xKey,
  formatX,
  formatValue,
}: Pick<XYChartProps, 'series' | 'xKey' | 'formatX'> & {
  datum: ChartDatum
  x: number
  y: number
  containerWidth: number
  formatValue: (value: number) => string
}) {
  const flip = x > containerWidth - TOOLTIP_WIDTH - GAP
  const left = flip ? x - GAP - TOOLTIP_WIDTH : x + GAP
  return (
    <m.div
      {...stylex.props(styles.float)}
      animate={{ x: left, y, opacity: 1 }}
      exit={{ opacity: 0, transition: exitTween.fast }}
      initial={{ x: left, y, opacity: 0 }}
      transition={spring.moderate}
    >
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.title)}>{datumLabel(datum, xKey, formatX)}</div>
        <div>
          {series.map((s) => (
            <div {...stylex.props(styles.row)} key={s.key}>
              <span {...stylex.props(chartStyles.swatchLabel)}>
                <span {...stylex.props(chartStyles.swatch, seriesSwatch[roleOf(s)])} />
                {s.label}
              </span>
              <span {...stylex.props(styles.value)}>{formatValue(cellValue(datum, s.key))}</span>
            </div>
          ))}
        </div>
      </div>
    </m.div>
  )
}

export function ChartFloatTooltip({
  datum,
  ...props
}: Omit<Parameters<typeof FloatCard>[0], 'datum'> & { datum: ChartDatum | undefined }) {
  return (
    <AnimatePresence>
      {datum !== undefined && <FloatCard datum={datum} {...props} />}
    </AnimatePresence>
  )
}
