import { Radio } from '@base-ui/react/radio'
import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import type { HTMLAttributes, ReactNode } from 'react'
import {
  breakpoint,
  color,
  cursor,
  layout,
  motion,
  radius,
  space,
  text,
} from '@/tokens/token-consts.stylex'
import { Badge } from '@/ui/badge'
import { Icon } from '@/ui/icon'

const styles = stylex.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: color.backgroundSurface,
    borderColor: {
      default: color.borderDefault,
      ':hover': { [breakpoint.hover]: color.borderBold },
      ':active': { default: color.borderBolder, [breakpoint.hover]: color.borderBolder },
    },
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: { default: null, ':focus-visible': layout.focusRing },
    cursor: cursor.pointer,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    minHeight: layout.controlHeightTouch,
    outline: 'none',
    padding: space.md,
    textAlign: 'start',
    transitionDuration: { default: motion.durationFast, [breakpoint.reducedMotion]: '0ms' },
    transitionProperty: 'background-color, border-color, box-shadow',
  },
  checked: {
    borderColor: {
      default: color.borderBolder,
      ':hover': { [breakpoint.hover]: color.borderBolder },
      ':active': { default: color.borderBolder, [breakpoint.hover]: color.borderBolder },
    },
  },
  disabled: { borderColor: color.borderDefault, cursor: cursor.notAllowed },
  muted: { color: color.textSubtlest },
  iconTile: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.md,
    color: color.iconDefault,
    display: 'inline-flex',
    height: layout.choiceIconTile,
    justifyContent: 'center',
    width: layout.choiceIconTile,
  },
  iconTileChecked: { backgroundColor: color.backgroundInverseSolid, color: color.textInverse },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
  },
  titleRow: {
    alignItems: 'center',
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  detail: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
})

interface CardState {
  checked: boolean
  disabled: boolean
}

interface CardFace {
  icon: IconSvgElement | undefined
  title: ReactNode
  detail?: ReactNode
  flag?: ReactNode
}

function renderCard({ icon, title, detail, flag }: CardFace) {
  return (props: HTMLAttributes<HTMLElement>, state: CardState) => (
    <span
      {...props}
      data-slot="choice-card"
      {...stylex.props(
        styles.card,
        state.checked && styles.checked,
        state.disabled && styles.disabled,
      )}
    >
      {icon !== undefined && (
        <span
          {...stylex.props(
            styles.iconTile,
            state.checked && styles.iconTileChecked,
            state.disabled && styles.muted,
          )}
        >
          <Icon icon={icon} size="lg" />
        </span>
      )}
      <span {...stylex.props(styles.titleRow)}>
        <span {...stylex.props(styles.title, state.disabled && styles.muted)}>{title}</span>
        {flag !== undefined && <Badge>{flag}</Badge>}
      </span>
      {detail !== undefined && (
        <span {...stylex.props(styles.detail, state.disabled && styles.muted)}>{detail}</span>
      )}
    </span>
  )
}

export function ChoiceCard({
  value,
  icon,
  title,
  detail,
  flag,
  disabled,
}: {
  value: string
  icon?: IconSvgElement
  title: ReactNode
  detail?: ReactNode
  flag?: ReactNode
  disabled?: boolean
}) {
  const render = renderCard({ icon, title, detail, flag })
  return <Radio.Root disabled={disabled} value={value} render={render} />
}
