import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import * as stylex from '@stylexjs/stylex'
import type { ReactElement } from 'react'

import { color, cursor, layout, space, text } from '@/tokens/token-consts.stylex'
import { DisclosureChevron } from '@/ui/accordion'
import { disclosureVars } from '@/ui/accordion.stylex'

const styles = stylex.create({
  trigger: {
    [disclosureVars.turn]: { default: '0deg', ':is([data-panel-open])': '180deg' },
    alignItems: 'center',
    boxShadow: { ':focus-visible': layout.focusRing, default: null },
    color: color.textDefault,
    cursor: cursor.pointer,
    display: 'flex',
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    gap: space.xs,
    justifyContent: 'space-between',
    outline: 'none',
    textAlign: 'start',
    width: '100%',
  },

  triggerLarge: {
    color: color.textBody,
    fontSize: text.sizeBody,
    lineHeight: text.leadingBody,
    paddingBlock: space.lg,
  },

  triggerRow: {
    minHeight: layout.rowHeight,
    paddingBlock: space.xs,
  },

  panel: {
    overflow: 'hidden',
  },
})

export type CollapsibleProps = Omit<CollapsiblePrimitive.Root.Props, 'className' | 'style'>

export function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

export type CollapsibleTriggerProps = Omit<
  CollapsiblePrimitive.Trigger.Props,
  'className' | 'size' | 'style' | 'render'
> & {
  size?: 'default' | 'lg' | 'row'
  render?: ReactElement
}

export function CollapsibleTrigger({
  size = 'default',
  render,
  children,
  ...props
}: CollapsibleTriggerProps) {
  if (render !== undefined) {
    return (
      <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} render={render}>
        {children}
      </CollapsiblePrimitive.Trigger>
    )
  }
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      {...props}
      {...stylex.props(
        styles.trigger,
        size === 'lg' && styles.triggerLarge,
        size === 'row' && styles.triggerRow,
      )}
    >
      {children}
      <DisclosureChevron />
    </CollapsiblePrimitive.Trigger>
  )
}

export type CollapsiblePanelProps = Omit<
  CollapsiblePrimitive.Panel.Props,
  'className' | 'style' | 'render'
>

export function CollapsiblePanel(props: CollapsiblePanelProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      {...props}
      {...stylex.props(styles.panel)}
    />
  )
}
