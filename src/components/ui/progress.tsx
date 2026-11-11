import * as stylex from '@stylexjs/stylex'
import { formatNumber } from '@/lib/format'
import { color, layout, radius, space, text } from '@/tokens/token-consts.stylex'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexBasis: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    gap: space.sm,
    minWidth: 0,
  },
  label: {
    color: color.textBody,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  track: {
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.full,
    display: 'block',
    flexGrow: 1,
    height: '4px',
    minWidth: layout.progressMinWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: (pct: number) => ({
    backgroundColor: color.backgroundBrand,
    borderRadius: radius.full,
    display: 'block',
    height: '100%',
    width: `${pct}%`,
  }),
  value: {
    color: color.textBody,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: text.leadingUi,
  },
})

export function Progress({
  value,
  max = 100,
  label,
  showPercent = true,
  'aria-label': ariaLabel,
}: {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  'aria-label'?: string
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <span {...stylex.props(styles.root)}>
      {label !== undefined && <span {...stylex.props(styles.label)}>{label}</span>}
      <span
        aria-label={ariaLabel ?? label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        role="progressbar"
        {...stylex.props(styles.track)}
      >
        <span {...stylex.props(styles.fill(pct))} />
      </span>
      {showPercent && <span {...stylex.props(styles.value)}>{`${formatNumber(pct)}%`}</span>}
    </span>
  )
}
