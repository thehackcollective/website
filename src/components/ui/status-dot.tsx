import * as stylex from '@stylexjs/stylex'
import { color, layout, radius, space, text } from '@/tokens/token-consts.stylex'
import { type StatusTone, statusToneStyles } from '@/ui/status-dot.stylex'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    color: color.textBody,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: text.fontSans,
    fontSize: text.sizeCaption,
    gap: space.stepGap,
    lineHeight: text.leadingCaption,
    whiteSpace: 'nowrap',
  },
  cell: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.stepGlyph,
    justifyContent: 'center',
    width: layout.stepGlyph,
  },
  dot: {
    borderRadius: radius.full,
    display: 'inline-block',
    flexShrink: 0,
    height: layout.dotSize,
    width: layout.dotSize,
  },
})

export function StatusDot({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span data-slot="status-dot" data-tone={tone} {...stylex.props(styles.root)}>
      <span aria-hidden {...stylex.props(styles.cell)}>
        <span {...stylex.props(styles.dot, statusToneStyles[tone])} />
      </span>
      {label}
    </span>
  )
}
