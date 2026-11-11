import * as stylex from '@stylexjs/stylex'
import { type ReactNode, useId } from 'react'
import { useHoldToConfirm } from '@/lib/hooks/use-hold-to-confirm'
import { color, cursor, layout, radius, space, text } from '@/tokens/token-consts.stylex'
import { ProgressRing } from '@/ui/progress-ring'
import { useControlSize } from '@/ui/size-provider'

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: color.backgroundDangerSubtle,
    borderRadius: radius.step,
    borderStyle: 'solid',
    borderWidth: 0,
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    color: { default: color.textDanger, ':disabled': color.textSubtlest },
    cursor: { default: cursor.pointer, ':disabled': cursor.notAllowed },
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    gap: space.xs,
    justifyContent: 'center',
    lineHeight: text.leadingUi,
    outline: 'none',
    position: 'relative',
    touchAction: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },
  sizeDefault: {
    height: layout.controlHeightLg,
    paddingInline: space.md,
  },
  sizeCompact: {
    height: layout.controlHeightMd,
    paddingInline: space.sm,
  },
  hint: {
    borderWidth: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
})

export function HoldButton({
  children,
  onConfirm,
  disabled,
}: {
  children: ReactNode
  onConfirm: () => void
  disabled?: boolean
}) {
  const size = useControlSize()
  const hintId = useId()
  const { progress, holding, holdProps } = useHoldToConfirm({ onConfirm })

  return (
    <button
      type="button"
      disabled={disabled}
      aria-describedby={hintId}
      {...holdProps}
      {...stylex.props(styles.base, size === 'compact' ? styles.sizeCompact : styles.sizeDefault)}
    >
      <ProgressRing progress={progress} settling={!holding} />
      {children}
      <span id={hintId} {...stylex.props(styles.hint)}>
        Press and hold to confirm
      </span>
    </button>
  )
}
