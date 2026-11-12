import * as stylex from '@stylexjs/stylex'
import { formatNumber } from '@/lib/format'
import { breakpoint, color, motion, radius, space, text } from '@/tokens/token-consts.stylex'
import { type Tone, toneColor } from '@/ui/tone.stylex'

export interface DistributionSegment {
  name: string
  value: number
  tone?: Tone
}

const CHART_TONES = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'chart6'] as const

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
  },
  bar: {
    borderRadius: radius.full,
    display: 'flex',
    height: '10px',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  empty: {
    backgroundColor: color.backgroundSunken,
    flexGrow: 1,
  },
  segment: {
    backgroundColor: 'currentColor',
    inset: 0,
    position: 'absolute',
    transitionDuration: { default: motion.durationSlow, [breakpoint.reducedMotion]: '0s' },
    transitionProperty: 'clip-path',
    transitionTimingFunction: motion.easeInOut,
  },
  legend: {
    columnGap: space.md,
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInline: 0,
    rowGap: space.xs,
  },
  legendItem: {
    alignItems: 'center',
    display: 'flex',
    gap: space.xs,
  },
  swatch: {
    backgroundColor: 'currentColor',
    borderRadius: radius['2xs'],
    flexShrink: 0,
    height: '10px',
    width: '10px',
  },
  legendName: {
    color: color.textSubtle,
  },
  legendShare: {
    color: color.textDefault,
    fontVariantNumeric: 'tabular-nums',
  },
  legendValue: {
    color: color.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },
})

const dynamicStyles = stylex.create({
  clip: (clipPath: string) => ({ clipPath }),
})

function edge(share: number, gapsBefore: number, gaps: number) {
  return `calc(${share} * (100% - ${gaps} * ${space['2xs']}) + ${gapsBefore} * ${space['2xs']})`
}

function percent(share: number) {
  return formatNumber(share, { format: 'percent' })
}

export function DistributionBar({
  label,
  segments,
}: {
  label: string
  segments: readonly DistributionSegment[]
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const resolved = segments.map((segment, index) => ({
    ...segment,
    tone: segment.tone ?? CHART_TONES[index % CHART_TONES.length] ?? 'chart1',
    share: total > 0 ? segment.value / total : 0,
  }))
  const visible = resolved.filter((segment) => segment.share > 0)
  const placed = visible.map((segment, index) => {
    const start = visible.slice(0, index).reduce((sum, item) => sum + item.share, 0)
    const end = 1 - start - segment.share
    const gaps = visible.length - 1
    return {
      ...segment,
      clip: `inset(0 ${edge(end, gaps - index, gaps)} 0 ${edge(start, index, gaps)})`,
    }
  })
  const summary =
    total === 0
      ? `${label}: no data`
      : `${label}: ${resolved.map((segment) => `${segment.name} ${formatNumber(segment.value)} (${percent(segment.share)})`).join(', ')}`

  return (
    <div data-slot="distribution-bar" {...stylex.props(styles.root)}>
      <div role="img" aria-label={summary} {...stylex.props(styles.bar)}>
        {total === 0 && <div {...stylex.props(styles.empty)} />}
        {placed.map((segment) => (
          <div
            key={segment.name}
            {...stylex.props(
              styles.segment,
              toneColor[segment.tone],
              dynamicStyles.clip(segment.clip),
            )}
          />
        ))}
      </div>
      <ul aria-label={label} {...stylex.props(styles.legend)}>
        {resolved.map((segment) => (
          <li key={segment.name} {...stylex.props(styles.legendItem)}>
            <span aria-hidden="true" {...stylex.props(styles.swatch, toneColor[segment.tone])} />
            <span {...stylex.props(styles.legendName)}>{segment.name}</span>
            <span {...stylex.props(styles.legendShare)}>{percent(segment.share)}</span>
            <span {...stylex.props(styles.legendValue)}>{formatNumber(segment.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
