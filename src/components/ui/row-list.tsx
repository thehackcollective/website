import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import { createContext, type ReactNode, useContext } from 'react'
import { Link } from 'react-router'
import { useFluidHover } from '@/lib/hooks/use-fluid-hover'
import { FluidHoverHighlight } from '@/ui/fluid-hover-highlight'
import { fluidItemProps } from '@/ui/fluid-item'
import { Icon } from '@/ui/icon'
import { Pressable } from '@/ui/pressable'
import { rowListStyles as styles } from '@/ui/row-list.stylex'

const RowListContext = createContext<(el: HTMLElement) => void>(() => undefined)

export function RowList({ children }: { children: ReactNode }) {
  const { containerRef, highlightProps, onItemEnter, onLeave } = useFluidHover<HTMLDivElement>()
  return (
    <RowListContext.Provider value={onItemEnter}>
      <div ref={containerRef} {...stylex.props(styles.list)} onPointerLeave={onLeave}>
        <FluidHoverHighlight {...highlightProps} tone="canvas" corner="nestLgXs" />
        {children}
      </div>
    </RowListContext.Provider>
  )
}

interface RowListItemProps {
  title: string
  detail?: string
  value?: string
  action?: IconSvgElement
  actions?: ReactNode
  active?: boolean
  unread?: boolean
  to?: string
  onClick?: () => void
}

function RowContent({
  title,
  detail,
  value,
  action,
  actions,
  active,
  unread,
  onClick,
  titleTo,
}: RowListItemProps & { titleTo?: string }) {
  const titleStyles = stylex.props(
    styles.title,
    unread === false && styles.titleRead,
    active && styles.titleActive,
    titleTo !== undefined && styles.titleLink,
  )
  return (
    <>
      <span {...stylex.props(styles.rowText)}>
        <span {...stylex.props(styles.titleRow)}>
          {titleTo === undefined ? (
            <span {...titleStyles}>{title}</span>
          ) : (
            <Link
              to={titleTo}
              onClick={onClick}
              aria-current={active ? 'true' : undefined}
              {...titleStyles}
            >
              {title}
            </Link>
          )}
          {unread && <span aria-hidden {...stylex.props(styles.unreadDot)} />}
        </span>
        {detail && <span {...stylex.props(styles.detail)}>{detail}</span>}
      </span>
      {value !== undefined && (
        <span {...stylex.props(styles.trailing, action !== undefined && styles.actionSlot)}>
          <span {...stylex.props(styles.value, action !== undefined && styles.valueSwap)}>
            {value}
          </span>
          {action !== undefined && (
            <span {...stylex.props(styles.actionIcon)}>
              <Icon icon={action} />
            </span>
          )}
        </span>
      )}
      {actions !== undefined && <span {...stylex.props(styles.actions)}>{actions}</span>}
    </>
  )
}

export function RowListItem(props: RowListItemProps) {
  const { active = false, to, onClick, actions } = props
  const onItemEnter = useContext(RowListContext)
  const handlers = fluidItemProps(onItemEnter)
  const current = active ? 'true' : undefined
  const withActions = actions !== undefined && styles.rowWithActions

  if (to && actions !== undefined) {
    return (
      <div
        {...handlers}
        {...stylex.props(styles.row, withActions, styles.rowStatic, active && styles.rowActive)}
      >
        <RowContent {...props} titleTo={to} />
      </div>
    )
  }
  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-current={current}
        {...handlers}
        {...stylex.props(
          stylex.defaultMarker(),
          styles.row,
          withActions,
          active && styles.rowActive,
        )}
      >
        <RowContent {...props} />
      </Link>
    )
  }
  if (!onClick) {
    return (
      <div {...stylex.props(styles.row, withActions, styles.rowStatic, active && styles.rowActive)}>
        <RowContent {...props} />
      </div>
    )
  }
  return (
    <Pressable
      surface="row"
      type="button"
      onClick={onClick}
      aria-current={current}
      style={[stylex.defaultMarker()]}
      {...handlers}
    >
      <span {...stylex.props(styles.rowContent, withActions, active && styles.rowActive)}>
        <RowContent {...props} />
      </span>
    </Pressable>
  )
}
