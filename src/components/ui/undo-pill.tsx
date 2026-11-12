import * as stylex from '@stylexjs/stylex'
import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { exitTween, spring } from '@/lib/motion'
import {
  breakpoint,
  color,
  cursor,
  layout,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { ProgressRing } from '@/ui/progress-ring'

const styles = stylex.create({
  pill: {
    alignItems: 'center',
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: radius.pill,
    borderStyle: 'solid',
    borderWidth: '1px',
    bottom: `calc(${space.safeBottom} + ${space.xl})`,
    color: color.textDefault,
    display: 'inline-flex',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    gap: space.sm,
    left: '50%',
    lineHeight: text.leadingUi,
    paddingBlock: { default: null, [breakpoint.mobile]: space.xs },
    paddingInline: space.md,
    position: 'fixed',
    whiteSpace: 'nowrap',
    zIndex: 60,
  },
  inline: {
    borderColor: color.borderDefault,
    borderStyle: 'solid',
    borderWidth: '1px',
    bottom: null,
    boxShadow: null,
    left: null,
    position: 'relative',
    zIndex: null,
  },
  compact: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    gap: space.xxs,
    paddingBlock: 0,
    paddingInline: 0,
  },
  compactLabel: {
    clipPath: 'inset(100%)',
    height: space['3xs'],
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: space['3xs'],
  },
  undo: {
    backgroundColor: {
      default: 'transparent',
      ':hover': { [breakpoint.hover]: color.backgroundNeutralHover },
      ':active': {
        default: color.backgroundNeutralBold,
        [breakpoint.hover]: color.backgroundNeutralBold,
      },
    },
    borderRadius: radius.pill,
    borderWidth: 0,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    color: color.textBrand,
    cursor: cursor.pointer,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingUi,
    minHeight: { default: '44px', [breakpoint.mobile]: 'auto' },
    minWidth: { default: '44px', [breakpoint.mobile]: 'auto' },
    outline: 'none',
    paddingBlock: space['2xs'],
    paddingInline: space.xs,
  },
  undoCompact: {
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    minHeight: layout.rowHeight,
    minWidth: layout.rowHeight,
    paddingBlock: 0,
    paddingInline: space.xxs,
  },
})

export function UndoPill({
  label,
  onUndo,
  progress,
  placement = 'floating',
  compact = false,
}: {
  label: ReactNode
  onUndo: () => void
  progress: number
  placement?: 'floating' | 'inline'
  compact?: boolean
}) {
  const x = placement === 'floating' ? '-50%' : 0
  return (
    <m.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, x, y: 12 }}
      animate={{ opacity: 1, x, y: 0, transition: spring.slow }}
      exit={{ opacity: 0, x, y: 8, transition: exitTween.slow }}
      {...stylex.props(
        styles.pill,
        placement === 'inline' && styles.inline,
        compact && styles.compact,
      )}
    >
      <ProgressRing progress={progress} />
      <span {...stylex.props(compact && styles.compactLabel)}>{label}</span>
      <button
        type="button"
        onClick={onUndo}
        {...stylex.props(styles.undo, compact && styles.undoCompact)}
      >
        Undo
      </button>
    </m.div>
  )
}
