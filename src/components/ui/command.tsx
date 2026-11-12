import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import { type KeyboardEvent, type ReactNode, type RefObject, useId, useState } from 'react'
import { Button } from '@/ui/button'
import { commandStyles as styles } from '@/ui/command.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { Pressable } from '@/ui/pressable'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'
import { SearchField } from '@/ui/search-field'
import { type AxisDirection, SharedAxis } from '@/ui/shared-axis'

export interface CommandItem {
  key: string
  icon?: IconSvgElement
  lead?: ReactNode
  title: string
  detail?: string | undefined
  drill?: boolean
  selected?: boolean
  run: () => void
}

export interface CommandGroup {
  label?: string
  items: readonly CommandItem[]
}

export interface CommandView {
  title?: string
  placeholder?: string
  groups: readonly CommandGroup[]
}

function revealOption(node: HTMLButtonElement | null) {
  node?.scrollIntoView({ block: 'nearest' })
}

const visible = (view: CommandView) => view.groups.filter((group) => group.items.length > 0)

export function Command({
  label,
  query,
  onQueryChange,
  view,
  direction,
  resolve,
  onBack,
  inputRef,
  action,
}: {
  label: string
  query: string
  onQueryChange: (query: string) => void
  view: string
  direction: AxisDirection
  resolve: (view: string, live: boolean) => CommandView
  onBack?: (() => void) | undefined
  inputRef?: RefObject<HTMLInputElement | null>
  action?: ReactNode
}) {
  const listId = useId()
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const current = resolve(view, true)
  const items = visible(current).flatMap((group) => group.items)
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.key === highlighted),
  )
  const active = items[activeIndex]
  const optionId = (key: string) => `${listId}-${key.replace(/[^a-zA-Z0-9-]/g, '-')}`

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const empty = query === ''
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && items.length > 0) {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setHighlighted(items[(activeIndex + step + items.length) % items.length]?.key ?? null)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      active?.run()
    } else if (event.key === 'ArrowRight' && empty && active?.drill) {
      event.preventDefault()
      active.run()
    } else if (
      onBack !== undefined &&
      (event.key === 'Escape' ||
        (empty && (event.key === 'ArrowLeft' || event.key === 'Backspace')))
    ) {
      event.preventDefault()
      event.stopPropagation()
      setHighlighted(null)
      onBack()
    }
  }

  const renderView = (key: string, live: boolean) => {
    const shown = live ? current : resolve(key, false)
    const groups = visible(shown)
    return (
      <div {...stylex.props(styles.pane)}>
        {shown.title !== undefined && (
          <div {...stylex.props(styles.header)}>
            <span {...stylex.props(styles.headerBack)}>
              <Button variant="ghost" size="sm" tabIndex={-1} onClick={onBack}>
                <Icon icon={icons.back} />
                Back
              </Button>
            </span>
            <span {...stylex.props(styles.headerTitle)}>{shown.title}</span>
          </div>
        )}
        {groups.length === 0 && (
          <p aria-hidden={live} {...stylex.props(styles.empty)}>
            Nothing matches “{query}”
          </p>
        )}
        {live && (
          <p role="status" {...stylex.props(primitiveStyles.srOnly)}>
            {groups.length === 0 ? `Nothing matches “${query}”` : ''}
          </p>
        )}
        {groups.map((group) => (
          <div
            key={group.label ?? group.items[0]?.key ?? 'empty'}
            role="group"
            aria-label={group.label}
            {...stylex.props(styles.group)}
          >
            {group.label !== undefined && (
              <span aria-hidden {...stylex.props(styles.groupHeading)}>
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const on = live && item.key === active?.key
              return (
                <Pressable
                  key={item.key}
                  surface="row"
                  id={live ? optionId(item.key) : undefined}
                  role="option"
                  aria-selected={on}
                  tabIndex={-1}
                  ref={on ? revealOption : undefined}
                  onPointerMove={live ? () => setHighlighted(item.key) : undefined}
                  onClick={item.run}
                  style={[styles.item, on && styles.itemActive]}
                >
                  {item.lead ?? (item.icon !== undefined && <Icon icon={item.icon} />)}
                  <span {...stylex.props(styles.itemLabel)}>{item.title}</span>
                  {item.detail !== undefined && (
                    <span {...stylex.props(styles.itemDetail)}>{item.detail}</span>
                  )}
                  {item.selected && (
                    <span {...stylex.props(styles.trail)}>
                      <Icon icon={icons.checked} label="Current" />
                    </span>
                  )}
                  {item.drill && (
                    <span {...stylex.props(styles.trail)}>
                      <Icon icon={icons.forward} />
                    </span>
                  )}
                </Pressable>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const placeholder = current.placeholder ?? label
  return (
    <div data-slot="command" {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.searchRow)}>
        <SearchField
          ref={inputRef}
          size="large"
          variant="bare"
          action={action}
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls={listId}
          aria-activedescendant={active === undefined ? undefined : optionId(active.key)}
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setHighlighted(null)
          }}
          onKeyDown={keyDown}
        />
      </div>
      <div id={listId} role="listbox" aria-label="Results" {...stylex.props(styles.results)}>
        <SharedAxis viewKey={view} direction={direction} render={renderView} />
      </div>
    </div>
  )
}
