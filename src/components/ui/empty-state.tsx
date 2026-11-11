import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/ui/button'
import { emptyStateStyles as styles } from '@/ui/empty-state.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { type FigureLoader, LineFigure } from '@/ui/line-figure'
import { Body } from '@/ui/text'

export type EmptySize = 'compact' | 'page'

export type EmptyStateAction =
  | { label: string; onClick: () => void; disabled?: boolean }
  | { label: string; to: string }

interface EmptyShared {
  tone?: never
  size?: EmptySize
  surface?: boolean
  figure?: FigureLoader
  icon?: IconSvgElement
  actionVariant?: 'primary' | 'secondary'
  title: ReactNode
}

interface NothingYetProps extends EmptyShared {
  kind: 'empty'
  description: ReactNode
  primaryAction: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

interface FilteredProps extends EmptyShared {
  kind: 'filtered'
  primaryAction: EmptyStateAction
}

interface ClearProps extends EmptyShared {
  kind: 'clear'
}

interface DeniedProps extends EmptyShared {
  kind: 'denied'
  description: ReactNode
  primaryAction?: EmptyStateAction
}

interface ErrorToneProps {
  tone: 'error'
  kind?: never
  size?: EmptySize
  surface?: boolean
  title: ReactNode
  description?: ReactNode
  onRetry?: () => void
  homeAction?: EmptyStateAction
}

export type EmptyContent = NothingYetProps | FilteredProps | ClearProps | DeniedProps

type EmptyStateProps = EmptyContent | ErrorToneProps

function defaultIcon(props: EmptyStateProps): IconSvgElement | undefined {
  if (props.tone === 'error') return icons.warning
  if (props.icon !== undefined) return props.icon
  if (props.kind === 'filtered') return icons.search
  if (props.kind === 'clear') return icons.done
  return undefined
}

function Visual({ props, size }: { props: EmptyStateProps; size: EmptySize }) {
  const compact = size === 'compact'
  if (props.tone !== 'error' && props.figure !== undefined) {
    return <LineFigure load={props.figure} size={size} />
  }
  const icon = defaultIcon(props)
  if (icon === undefined) return null
  return (
    <span
      {...stylex.props(
        styles.iconTile,
        compact && styles.iconTileCompact,
        props.tone === 'error' && styles.iconTileError,
        props.kind === 'clear' && styles.iconTileClear,
      )}
    >
      <Icon icon={icon} size={compact ? 'md' : 'lg'} />
    </span>
  )
}

function Actions({
  primary,
  primaryVariant,
  secondary,
  tertiary,
}: {
  primary: EmptyStateAction | undefined
  primaryVariant: 'primary' | 'secondary'
  secondary: EmptyStateAction | undefined
  tertiary?: EmptyStateAction | undefined
}) {
  if (primary === undefined && secondary === undefined && tertiary === undefined) return null
  return (
    <div {...stylex.props(styles.actions)}>
      {primary && <ActionButton action={primary} variant={primaryVariant} />}
      {secondary && <ActionButton action={secondary} variant="secondary" />}
      {tertiary && <ActionButton action={tertiary} variant="ghost" />}
    </div>
  )
}

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction
  variant: 'primary' | 'secondary' | 'ghost'
}) {
  if ('to' in action) {
    return (
      <Button variant={variant} size="sm" nativeButton={false} render={<Link to={action.to} />}>
        {action.label}
      </Button>
    )
  }
  return (
    <Button
      variant={variant}
      size="sm"
      disabled={action.disabled ?? false}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  )
}

export function EmptyState(props: EmptyStateProps) {
  const error = props.tone === 'error'
  const size = props.size ?? 'page'
  return (
    <div
      data-slot="empty-state"
      data-tone={error ? 'error' : props.kind}
      data-size={size}
      role={error ? 'alert' : undefined}
      {...stylex.props(
        styles.root,
        size === 'compact' && styles.compact,
        props.surface === true && styles.surface,
      )}
    >
      <Visual props={props} size={size} />
      <div {...stylex.props(styles.text)}>
        <h2 {...stylex.props(styles.title)}>{props.title}</h2>
        {'description' in props && props.description && <Body>{props.description}</Body>}
      </div>
      {error ? (
        <Actions
          primary={undefined}
          primaryVariant="secondary"
          secondary={props.onRetry && { label: 'Try again', onClick: props.onRetry }}
          tertiary={props.homeAction}
        />
      ) : (
        <Actions
          primary={'primaryAction' in props ? props.primaryAction : undefined}
          primaryVariant={props.actionVariant ?? (size === 'compact' ? 'secondary' : 'primary')}
          secondary={'secondaryAction' in props ? props.secondaryAction : undefined}
        />
      )}
    </div>
  )
}

type MissClears = 'filters' | 'search'

function filterMiss(title: ReactNode, onClear: () => void, clears: MissClears): EmptyContent {
  return {
    kind: 'filtered',
    title,
    primaryAction: {
      label: clears === 'search' ? 'Clear search' : 'Clear filters',
      onClick: onClear,
    },
  }
}

export function FilterMiss({
  title,
  onClear,
  clears = 'filters',
}: {
  title: ReactNode
  onClear: () => void
  clears?: MissClears
}) {
  return <EmptyState size="compact" {...filterMiss(title, onClear, clears)} />
}
